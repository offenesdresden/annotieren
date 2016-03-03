'use strict'

var fs = require('fs')
var child_process = require('child_process')
var through = require('through2')
var split = require('split')
var elasticsearch = require('elasticsearch')
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
    // TODO: pdftohtml
    cb(null, data.json)
  }))
  .pipe(batchify(64))
  .pipe(jsonsToElasticBatch())
  .pipe(elasticSink())
