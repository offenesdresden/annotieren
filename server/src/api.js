'use strict'

var fs = require('fs')
var express = require('express')
var through = require('through2')
var elasticsearch = require('elasticsearch')
var bodyParser = require('body-parser')
var bcrypt = require('bcrypt')
var sessions = require('client-sessions')

var htmlProcess = require('./html_process')
var httpError = require('./http_error')

function oparlType(type) {
  return `https://oparl.org/schema/1.0/${type}`
}

const SEARCH_TYPES = ['Meeting', 'Paper', 'File']


function toHitsSources(result) {
  return result.hits.hits.map(hit => hit._source)
}

// Reorder blocks in a page by vertical, then horizontal position
function reorderPageBlocks(page) {
  // Perform a bubble-sort that is slow but stable:
  let blocks = page.contents
  let done
  do {
    done = true

    for(let i = 0; i < blocks.length - 1; i++) {
      let swap = false
      let a = blocks[i]
      let b = blocks[i + 1]

      let ma, mb
      if (a.style && a.style.top &&
          (ma = a.style.top.match(/(\d+)px/)) &&
          b.style && b.style.top &&
          (mb = b.style.top.match(/(\d+)px/))) {
        let ta = parseInt(ma[1], 10)
        let tb = parseInt(mb[1], 10)

        if (ta < tb) {
          // Ok
        } else if (ta > tb) {
          swap = true
        } else {
          if (a.style && a.style.top &&
              (ma = a.style.left.match(/(\d+)px/)) &&
              b.style && b.style.top &&
              (mb = b.style.left.match(/(\d+)px/))) {
            let la = parseInt(ma[1], 10)
            let lb = parseInt(mb[1], 10)

            if (la < lb) {
              // Ok
            } else if (la > lb) {
              swap = true
            }
          }
        }
      }

      if (swap) {
        blocks[i + 1] = a
        blocks[i] = b
        done = false
      }
    }
  } while(!done)

  return page
}

class API {
  constructor(conf) {
    this.conf = conf
    this.elasticsearch = new elasticsearch.Client({
      host: conf.elasticsearchUrl,
      log: 'info'
    })
  }

  // We first check if the username already exists.
  //
  // Because ElasticSearch doesn't provide transactions, a negligible
  // race condition opens up between the two operations.
  register(username, password, cb) {
    if (/\s/.test(username)) {
      return cb(new Error("Username must not contain white-space"))
    }

    this.elasticsearch.get({
      index: 'users',
      type: 'account',
      id: username
    }, (err, res) => {
      if (err && err.message !== 'Not Found') {
        return cb(err)
      }
      if (res && res.found !== false) {
        return cb(new Error("Username already exists"))
      }

      bcrypt.hash(password, 8, (err, hash) => {
        if (err) {
          return cb(err)
        }

        this.elasticsearch.index({
          index: 'users',
          type: 'account',
          id: username,
          body: {
            hash,
            created: new Date().toISOString()
          }
        }, err => cb(err))
      })
    })
  }

  login(username, password, cb) {
    this.elasticsearch.get({
      index: 'users',
      type: 'account',
      id: username
    }, (err, res) => {
      if (err) {
        return cb(err)
      }

      bcrypt.compare(password, res._source.hash, (err, res) => {
        if (err) {
          return cb(err)
        }

        if (res) {
          // Hash matches, login ok
          cb()
        } else {
          cb(new Error("Access denied"))
        }
      })
    })
  }

  getDocFragments(docId, res) {
    res.writeHead(200, {
      'Content-Type': 'application/json'
    })

    let htmlPath = this.conf.getHtmlPath(docId)
    console.log(`Processing ${docId}: ${htmlPath}`)
    fs.createReadStream(htmlPath)
      .on('error', e => {
        console.log("File error:", e.stack || e)
        res.end()
      })
      .pipe(htmlProcess())
      .pipe(through.obj((page, enc, cb) => {
        cb(null, reorderPageBlocks(page))
      }))
      .pipe(toJsonArray())
      .pipe(res)
      .on('error', e => {
        console.log("Error:", e.stack || e)
        res.end()
      })
  }

  get(type, id, res) {
    this.elasticsearch.get({
      index: 'oparl',
      type: type,
      id: id
    }).then(result => {
      res.writeHead(200, {
        'Content-Type': 'application/json'
      })
      res.write(JSON.stringify(result._source))
      res.end()
    }, err => {
      console.log("ES get:", err.stack)
      if (err.message == "Not Found") {
        res.writeHead(404, {
          'Content-Type': 'application/json'
        })
        res.write(JSON.stringify({ error: err.message }))
      } else {
        res.writeHead(500, {
          'Content-Type': 'text/plain'
        })
        res.write(err.message.toString())
      }
      res.end()
    })
  }

  _search(body, res, mapper) {
    this.elasticsearch.search({
      index: 'oparl',
      body: body
    }).then(result =>
      mapper ? mapper(result) : result
    ).then(body => {
      res.writeHead(200, {
        'Content-Type': 'application/json'
      })
      res.write(JSON.stringify(body))
      res.end()
    }, err => {
      console.log("ES search:", err.stack)
      res.writeHead(500, {
        'Content-Type': 'text/plain'
      })
      res.write(err.message.toString())
      res.end()
    })
  }

  searchDocs(queryString, res) {
    let query = queryString ? {
      query_string: {
        default_operator: 'AND',
        analyze_wildcard: true,
        query: queryString
      }
    } : {
      match_all: {}
    }
    this._search({
      query: {
        bool: {
          must: query,
          filter: {
            or: SEARCH_TYPES.map(type => {
              return {
                type: {
                  value: type
                }
              }
            })
          }
        }
      },
      sort: [
        { _score: "desc" },  // ES scoring
        { publishedDate: "desc" },  // type Paper
        { start: "desc" }  // type Meeting
        // { date: "desc" }  // type File
      ]
    }, res, toHitsSources)
  }

  findFileContext(id, res) {
    this._search({
      query: {
        or: [{
          match: {
            invitation: id
          }
        }, {
          match: {
            resultsProtocol: id
          }
        }, {
          match: {
            verbatimProtocol: id
          }
        }, {
          match: {
            auxiliaryFile: id
          }
        }, {
          match: {
            resolutionFile: id
          }
        }, {
          match: {
            mainFile: id
          }
        }]
      }
    }, res, toHitsSources)
  }

  findPaperContext(id, res) {
    // TODO: doesn't work at all
    this._search({
      query: {
        nested: {
          path: "agendaItem",
          query: {
            bool: {
              must: {
                match: {
                  "agendaItem.consultation.parentID": id
                }
              }
            }
          }
        }
      }
    }, res, toHitsSources)
  }

  suggestMetadata(type, text, res) {
    // Capitalize
    type = type.replace(/^(.)/, s => s.toUpperCase())

    let searchSuggestions = attempt => {
      let multiMatchQuery = {
        query: text,
        fields: ['name^2', 'shortName^3', 'id']
      }
      switch(attempt) {
      case 1:
        multiMatchQuery.type = 'phrase_prefix'
        break;
      case 2:
        multiMatchQuery.type = 'best_fields'
        multiMatchQuery.operator = 'OR'
        break;
      default:
        throw "Invalid attempt!"
      }

      return this.elasticsearch.search({
        index: 'oparl',
        type: type,
        body: {
          query: {
            multi_match: multiMatchQuery
          }
        }
      }).then(toHitsSources)
    }

    searchSuggestions(1)
      .then(hits => {
        if (hits.length > 0) {
          return hits
        } else {
          return searchSuggestions(2)
        }
      })
      .then(hits => {
        res.writeHead(200, {
          'Content-Type': 'application/json'
        })
        res.write(JSON.stringify(hits))
        res.end()
      }, err => {
        console.log("ES search:", err.stack)
        res.writeHead(500, {
          'Content-Type': 'text/plain'
        })
        res.write(err.message.toString())
        res.end()
      })
  }

  _indexAnnotation(req, cb) {
    req.index = 'annotations'
    req.type = 'text'
    delete req.body._id
    if (req.body.id) {
      req.id = req.body.id
      delete req.body.id
    }

    this.elasticsearch.index(req, (err, res) => {
      cb(err, res && res._id)
    })
  }

  createAnnotation(annotation, username, cb) {
    // Prepare
    annotation.created = new Date().toISOString()
    delete annotation.id  // Let ES auto-generate

    if (username) {
      annotation.createdBy = username
    } else {
      return cb(new httpError.Forbidden("Please authenticate"))
    }

    // Set!
    this._indexAnnotation({ body: annotation }, cb)
  }

  // We could use ES' _version but actually we don't want users to run
  // into errors. Also, annotations are fairly atomic records. Thus we
  // simply overwrite them.
  updateAnnotation(annotation, username, cb) {
    // Get
    this.elasticsearch.get({
      index: 'annotations',
      type: 'text',
      id: annotation.id
    }, (err, res) => {
      if (!res.found) {
        return cb(new httpError.NotFound("Not found"))
      }
      // Prepare
      let oldAnnotation = res._source
      annotation.created = oldAnnotation.created
      annotation.createdBy = oldAnnotation.createdBy

      annotation.updated = new Date().toISOString()
      if (username) {
        annotation.updatedBy = username
      } else {
        return cb(new httpError.Forbidden("Please authenticate"))
      }

      // Set!
      this._indexAnnotation({ body: annotation }, cb)
    })
  }

  deleteAnnotation(fileId, annotationId, cb) {
    this.elasticsearch.delete({
      index: 'annotations',
      type: 'text',
      id: annotationId
    }, err => cb(err))
  }

  // TODO: use toJsonArray()
  getDocAnnotations(opts, res) {
    let elasticsearch = this.elasticsearch
    let i = 0
    elasticsearch.search({
      index: 'annotations',
      scroll: '30s',
      body: {
        query: {
          match: {
            fileId: opts.fileId
          }
        }
      },
      // Optimization:
      sort: ['_doc']
    }, function getMore(err, result) {
      if (err) {
        console.log("ES search:", err.stack)
        res.writeHead(500, {
          'Content-Type': 'text/plain'
        })
        res.write(err.message.toString())
        res.end()
        return
      }

      if (!res.headersSent) {
        res.writeHead(200, {
          'Content-Type': 'application/json'
        })
        res.write("[")
      }

      for(var hit of result.hits.hits) {
        if (i > 0) res.write(",")
        let annotation = hit._source
        annotation.id = hit._id
        res.write(JSON.stringify(annotation))
        res.write("\n")

        i++
      }

      if (i < result.hits.total) {
        elasticsearch.scroll({
          scrollId: result._scroll_id,
          scroll: '30s'
        }, getMore)
      } else {
        res.write("]")
        res.end()
      }
    })
  }

  getAnnotatedFiles(opts, res) {
    this.elasticsearch.search({
      index: 'annotations',
      type: 'text',
      body: {
        size: 0,
        aggs: {
          files: {
            filter: {
              term: {
                "paper.id": opts.paper
              }
            },
            aggs: {
              files: {
                terms: {
                  field: 'fileId'
                }
              }
            }
          }
        }
      }
    }).then(result =>
      result.aggregations.files.files.buckets.map(bucket => bucket.key)
    ).then(body => {
      res.writeHead(200, {
        'Content-Type': 'application/json'
      })
      res.write(JSON.stringify(body))
      res.end()
    }, err => {
      console.log("ES agg:", err.stack)
      httpError.write(err, res)
    })
  }
}

const SESSION_KEY_PATH = `${__dirname}/../session.key`

function getOrGenerateSessionSecret() {
  try {
    return fs.readFileSync(SESSION_KEY_PATH)
  } catch (e) {
    console.log(`Cannot read ${SESSION_KEY_PATH}, generating anew...`)

    let key = new Buffer(32)
    for(let i = 0; i < key.length; i++) {
      key[i] = Math.floor(255 * Math.random())
    }
    fs.writeFileSync(SESSION_KEY_PATH, key)
    return key
  }
}

module.exports = function(conf) {
  let api = new API(conf)
  var app = express()

  app.use(bodyParser.json())
  app.use(sessions({
    cookieName: 'session',
    secret: getOrGenerateSessionSecret(),
    duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
    activeDuration: 1000 * 60 * 5, // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
    cookie: {
      path: '/api', // cookie will only be sent to requests under '/api'
      ephemeral: false, // when true, cookie expires when the browser closes
      httpOnly: true, // when true, cookie is not accessible from javascript
      secure: false, // when true, cookie will only be sent over SSL. use key 'secureProxy' instead if you handle SSL not in your node process
      secureProxy: false // TODO: switch on for production
    }
  }))

  app.post('/register', (req, res) => {
    api.register(req.body.username, req.body.password, err => {
      if (err) {
        console.error(err.stack || err.message)
        res.writeHead(500, {
          'Content-Type': 'application/json'
        })
        res.write(JSON.stringify({ error: err.message }))
        res.end()
        return
      }

      req.session.username = req.body.username

      res.writeHead(200, {
        'Content-Type': 'application/json'
      })
      res.write(JSON.stringify({ username: req.body.username }))
      res.end()
    })
  })
  app.get('/login', (req, res) => {
    // TODO: restrict Origin
    res.writeHead(200, {
      'Content-Type': 'application/json'
    })
    res.write(JSON.stringify({
      username: req.session.username
    }))
    res.end()
  })
  app.post('/login', (req, res) => {
    api.login(req.body.username, req.body.password, err => {
      if (err) {
        console.error(err.stack || err.message)
        res.writeHead(500, {
          'Content-Type': 'application/json'
        })
        res.write(JSON.stringify({ error: err.message }))
        res.end()
        return
      }

      req.session.username = req.body.username

      res.writeHead(200, {
        'Content-Type': 'application/json'
      })
      res.write(JSON.stringify({ username: req.body.username }))
      res.end()
    })
  })
  app.post('/logout', (req, res) => {
    delete req.session.username

    res.writeHead(200, {
      'Content-Type': 'application/json'
    })
    res.write(JSON.stringify({}))
    res.end()
  })
  app.get('/search/', (req, res) => {
    api.searchDocs("", res)
  })
  app.get('/search/:query*', (req, res) => {
    api.searchDocs(req.params.query, res)
  })
  app.get('/oparl/file/:id', (req, res) => {
    api.get('File', req.params.id, res)
  })
  app.get('/oparl/paper/:id', (req, res) => {
    api.get('Paper', req.params.id, res)
  })
  app.get('/oparl/meeting/:id', (req, res) => {
    api.get('Meeting', req.params.id, res)
  })
  app.get('/oparl/person/:id', (req, res) => {
    api.get('Person', req.params.id, res)
  })
  app.get('/oparl/organization/:id', (req, res) => {
    api.get('Organization', req.params.id, res)
  })
  app.get('/oparl/file/:id/context', (req, res) => {
    api.findFileContext(req.params.id, res)
  })
  app.get('/oparl/paper/:id/context', (req, res) => {
    api.findPaperContext(req.params.id, res)
  })
  app.post('/suggest/:type', (req, res) => {
    api.suggestMetadata(req.params.type, req.body.text, res)
  })
  app.get('/file/:id/fragments', (req, res) => {
    api.getDocFragments(req.params.id, res)
  })
  app.get('/file/:id/annotations', (req, res) => {
    api.getDocAnnotations({
      fileId: req.params.id
    }, res)
  })
  app.post('/file/:id/annotations', (req, res) => {
    let annotation = req.body
    annotation.fileId = req.params.id

    api.createAnnotation(annotation, req.session.username, (err, annotationId) => {
      if (err) {
        console.error(err.stack || err.message)
        httpError.write(err, res)
        return
      }

      console.log(`File ${req.params.id}: created annotation ${annotationId}`)
      res.writeHead(201, "Created", {
        'Content-Type': 'application/json',
        Location: `/file/${req.params.id}/annotations/${annotationId}`
      })
      res.write(JSON.stringify({ id: annotationId }))
      res.end()
    })
  })
  app.put('/file/:id/annotations/:annotationId', (req, res) => {
    let annotation = req.body
    annotation.fileId = req.params.id

    api.updateAnnotation(annotation, req.session.username, err => {
      if (err) {
        console.error(err.stack || err.message)
        httpError.write(err, res)
        return
      }

      console.log(`File ${req.params.id}: updated annotation ${req.params.annotationId}`)
      res.writeHead(204, "No Content")
      res.end()
    })
  })
  app.delete('/file/:id/annotations/:annotationId', (req, res) => {
    if (!req.session.username) {
      res.writeHead(403, "Forbidden", {
        'Content-Type': 'application/json'
      })
      res.write(JSON.stringify({ error: "Please authenticate" }))
      res.end()
      return
    }

    api.deleteAnnotation(req.params.id, req.params.annotationId, err => {
      if (err) {
        console.error(err.stack || err.message)
        res.writeHead(500, {
          'Content-Type': 'application/json'
        })
        res.write(JSON.stringify({ error: "deleteAnnotation" }))
        res.end()
        return
      }

      console.log(`File ${req.params.id}: deleted annotation ${req.params.annotationId}`)
      res.writeHead(204, "No Content")
      res.end()
    })
  })
  app.get('/paper/:id/annotated_files', (req, res) => {
    api.getAnnotatedFiles({
      paper: req.params.id
    }, res)
  })

  // Catch all: 404
  app.use((req, res) => {
    res.writeHead(404, {
      'Content-Type': 'application/json'
    })
    res.write(JSON.stringify({ error: "Not found" }))
    res.end()
  })

  return app
}

function toJsonArray() {
  let count = 0
  return through.obj(function(fragment, enc, cb) {
    count++

    if (count === 1) {
      this.push("[\n")
    } else {
      this.push(",\n")
    }
    this.push(JSON.stringify(fragment))

    cb()
  }, function(cb) {
    this.push("\n]")
    cb()
  })
}

// SHIM for Object.values()
function objectValues(obj) {
  return Object.keys(obj).map(k => obj[k])
}
