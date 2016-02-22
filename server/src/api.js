'use strict'

var express = require('express')
let request = require('request')
var htmlProcess = require('./html_process')
var through = require('through2')




module.exports = function(conf) {
  var app = express()

  app.get('/docs/:docid/fragments', (req, res) => {
    let docId = req.params.docid

    res.writeHead(200, {
      'Content-Type': 'application/json'
    })

    console.log(`Processing ${docId}: ${conf.resources.htmlUrl(docId)}`)
    request(conf.resources.htmlUrl(docId))
      .pipe(htmlProcess())
      .pipe(toJsonArray())
      .pipe(res)
      .on('error', e => {
        console.log("Error:", e.stack || e)
        res.end()
      })
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
