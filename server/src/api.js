'use strict'

var express = require('express')
let request = require('request')
var htmlProcess = require('./html_process')
var through = require('through2')
var elasticsearch = require('elasticsearch')


class API {
  constructor(conf) {
    this.conf = conf
    this.elasticsearch = new elasticsearch.Client({
      host: conf.resources.elasticsearch,
      log: 'debug'
    })
  }

  getDocFragments(docId, res) {
    res.writeHead(200, {
      'Content-Type': 'application/json'
    })

    console.log(`Processing ${docId}: ${this.conf.resources.htmlUrl(docId)}`)
    request(this.conf.resources.htmlUrl(docId))
      .pipe(htmlProcess())
      .pipe(toJsonArray())
      .pipe(res)
      .on('error', e => {
        console.log("Error:", e.stack || e)
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
    this.elasticsearch.search({
      index: 'ratsinfo',
      type: 'pdf',
      body: {
        query: query,
        sort: [
          "_score",
          "started_at"
        ]
      }
    }).then(result =>
      groupBySessionAndTemplate(result.hits.hits.map(hit => hit._source))
    ).then(body => {
      res.writeHead(200, {
        'Content-Type': 'application/json'
      })
      res.write(JSON.stringify(body))
      res.end()
    }, err => {
      console.log("ES searchDocs for", query, ":", err)
      res.writeHead(500, {
        'Content-Type': 'text/plain'
      })
      res.write(err.message.toString())
      res.end()
    })
  }
}

function groupBySessionAndTemplate(hits) {
  let sessions = {}
  for(let hit of hits) {
    let session_id = hit.session_id
    let template_id = hit.template_id
    if (!sessions[session_id]) {
      sessions[session_id] = {
        id: hit.session_id,
        description: hit.session_description,
        started_at: hit.started_at,
        parts: {}
      }
    }
    delete hit.session_id
    delete hit.session_description
    delete hit.started_at
    if (!sessions[session_id].parts[template_id]) {
      sessions[session_id].parts[template_id] = {
        template_id: hit.template_id,
        description: hit.template_description,
        documents: []
      }
    }
    delete hit.template_id
    delete hit.template_description
    sessions[session_id].parts[template_id].documents.push(hit)
  }
  return objectValues(sessions).map(session => {
    session.parts = objectValues(session.parts)
    return session
  })
}


module.exports = function(conf) {
  let api = new API(conf)
  var app = express()

  app.get('/docs/search/', (req, res) => {
    api.searchDocs("", res)
  })
  app.get('/docs/search/:query*', (req, res) => {
    api.searchDocs(req.params.query, res)
  })
  app.get('/docs/:docid/fragments', (req, res) => {
    api.getDocFragments(req.params.docid, res)
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
