'use strict'

var fs = require('fs')
var child_process = require('child_process')
var through = require('through2')
var split = require('split')
var elasticsearch = require('elasticsearch')
var htmlProcess = require('./html_process')
var CONF = require('../config.js')


function batchify(size) {
  let queue = []

  return through.obj(function(data, enc, cb) {
    queue.push(data)

    if (queue.length < size) {
      // Return immediately
      cb()
    } else {
      // Yield a batch
      let batch = queue
      queue = []
      this.push(batch)
      cb()
    }
  }, function(cb) {
    // Flush on end
    let batch = queue
    queue = []
    this.push(batch)
    cb()
  })
}

function jsonsToElasticBatch() {
  return through.obj((jsons, enc, cb) => {
    let batch = []
    jsons.forEach(json => {
      let typeParts = json.type.split(/\//g)
      let type = typeParts[typeParts.length - 1]

      batch.push({ index: {
        _type: type,
        _id: json.id
      } })
      batch.push(json)
    })
    cb(null, batch)
  })
}

function elasticSink() {
  let es = new elasticsearch.Client({
    host: CONF.elasticsearchUrl,
    log: 'info'
  })

  return through.obj((data, enc, cb) => {
    console.log(`Indexing ${data.length / 2} documents`)
    es.bulk({
      index: CONF.elasticsearchOparlIndex,
      body: data
    }, (err, res) => cb(err))
  })
}

function pdftohtml(pdfPath, htmlPath, cb) {
  child_process.exec(`pdftohtml -i -s ${pdfPath}`, (err, stdout, stderr) => {
    if (err) return cb(err)

    stderr = stderr.toString()
    if (stderr) return cb(new Error(stderr))

    let basePath = pdfPath.replace(/\.pdf$/i, "")
    fs.unlink(`${basePath}s.html`, err => {
      // Ignore this err
      fs.rename(`${basePath}-html.html`, htmlPath, err => {
        cb(err)
      })
    })
  })
}

function htmlToText(htmlPath, cb) {
  let pages = []

  let proc = htmlProcess()
  proc.on('error', err => {
    cb(err)
    cb = () => {}
  })

  fs.createReadStream(htmlPath)
    .pipe(proc)
    .pipe(through.obj((page, enc, cb) => {
      pages.push(page.contents.map(
        block =>
          block.contents.map(getFragmentText).join("")
      ).join("\n"))
      cb()
    }, flushCb => {
      flushCb()
      cb(null, pages.join("\n\n\n"))
    }))
}

function getFragmentText(frag) {
  if (typeof frag === 'string') {
    return frag
  } else if (frag.contents) {
    return frag.contents.map(getFragmentText).join("")
  } else {
    return ""
  }
}

/*** Main pipeline ***/

child_process.spawn("/usr/bin/env", ["find", CONF.scrapeData, "-name", "*.json", "-type", "f"]).stdout
  .pipe(split())
  .pipe(through.obj((line, enc, cb) => {
    cb(null, line.toString('utf8'))
  }))
  .pipe(through.obj((path, enc, cb) => {
    if (!path) return cb()

    fs.readFile(path, (err, data) => {
      cb(err, {
        path: path,
        data: data
      })
    })
  }))
  .pipe(through.obj((data, enc, cb) => {
    let json = JSON.parse(data.data)
    cb(null, {
      path: data.path,
      json: json
    })
  }))
  .pipe(through.obj((data, enc, cb) => {
    // pdftohtml for Files
    if (/\/File$/.test(data.json.type)) {
      let pdfPath = data.path.replace(/\.json$/, ".pdf")
      data.htmlPath = pdfPath.replace(/\.pdf$/i, ".html")
      fs.access(data.htmlPath, err => {
        if (!err) {
          // .html already exists, skip
          return cb()
        }

        fs.access(pdfPath, err => {
          if (err) {
            // Can't access .pdf, ignore
            return cb(null, data)
          }

          let t1 = Date.now()
          pdftohtml(pdfPath, htmlPath, err => {
            if (err) {
              console.log("pdftohtml error: " + err.message)
              return cb(null, data)
            }

            let t2 = Date.now()
            console.log(`pdftohtml [${t2 - t1}ms] ${pdfPath}`)

            cb(null, data)
          })
        })
      })
    } else {
      // Pass through non-Files
      cb(null, data)
    }
  }))
  .pipe(through.obj((data, enc, cb) => {
    // extract text from pdftohtml result
    if (data.htmlPath) {
      htmlToText(data.htmlPath, (err, text) => {
        if (err) {
          console.log("htmlToText error: " + err.message)
          return cb(null, data)
        }

        data.json.text = text
        cb(err, data)
      })
    } else {
      cb(null, data)
    }
  }))
  .pipe(through.obj((data, enc, cb) => {
    // Actually, we only send the JSON to ES, not the paths
    cb(null, data.json)
  }))
  .pipe(batchify(64))
  .pipe(jsonsToElasticBatch())
  .pipe(elasticSink())
