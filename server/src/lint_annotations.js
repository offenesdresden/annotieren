'use strict'

var fs = require('fs')
var through = require('through2')
var elasticsearch = require('elasticsearch')
var ElasticsearchScrollStream = require('elasticsearch-scroll-stream')
var levenshtein = require('levenshtein-sse');
var htmlProcess = require('./html_process')
var CONF = require('../config.js')

let fileIds = []
let writing = false
for(let arg of process.argv.slice(2)) {
  switch(arg) {
  case "-h":
    console.log("Arguments: [flags] [fileIds ...]")
    console.log("\t-h\tThis help")
    console.log("\t-w\tWrite fixed offsets")
    process.exit(0)
    break
  case "-w":
    writing = true
    break
  default:
    fileIds.push(arg)
  }
}

let query
if (fileIds.length == 0) {
  query = { match_all: {} }
} else {
  query = {
    terms: {
      fileId: fileIds
    }
  }
}

var elasticsearch = new elasticsearch.Client({
  host: CONF.elasticsearchUrl,
  log: 'info'
})

let src = new ElasticsearchScrollStream(elasticsearch, {
  index: 'annotations',
  type: 'text',
  scroll: '10m',
  body: {
    query: query,
    sort: [
      { created: 'asc' }
    ]
  }
}, ['_id'], {
  objectMode: true
})

let fileId, fileText
src.pipe(through.obj(function(annotation, enc, cb) {
  // console.log("annotation", annotation)
  if (annotation.fileId !== fileId) {
    loadFragmentsAsText(annotation.fileId, function(err, text) {
      if (err) {
        console.error("loadFragments:", err.stack)
        return cb()
      }

      fileId = annotation.fileId
      fileText = text

      fixAnnotationOffset(annotation, fileText, cb)
    })
  } else {
    fixAnnotationOffset(annotation, fileText, cb)
  }
}))


function loadFragmentsAsText(fileId, cb) {
  let htmlPath = CONF.getHtmlPath(fileId)
  let result = ""
  console.log(`Processing ${fileId}: ${htmlPath}`)
  fs.createReadStream(htmlPath)
    .on('error', e => cb(e))
    .pipe(htmlProcess())
    .pipe(through.obj((page, enc, cb) => {
      cb(null, reorderPageBlocks(page))
    }))
    .pipe(through.obj((page, enc, cb) => {
      // Collect
      result += fragmentsToText(page)
      cb()
    }, doneCb => {
      // Return
      cb(null, result)
      doneCb()
    }))
    .on('error', e => {
      cb(e)
    })
}

// Works for any level: page, block, inline
function fragmentsToText(frag) {
  if (typeof frag == 'string') {
    return frag
  } else if (frag.contents) {
    return frag.contents
      .map(fragmentsToText)
      .join("")
  } else {
    return ""
  }
}

// Reorder blocks in a page by vertical, then horizontal position
// FIXME: Duplicated from api.js
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

function dump(s) {
  let r = JSON.stringify(s)
  if (r.length > 30) {
    return `${r.slice(0,15)}...${r.slice(r.length - 15)}`
  }
  return r
}

const MAX_LEN = 100

// Main logic
function fixAnnotationOffset(annotation, text, cb) {
  let bestBegin = annotation.begin, bestEnd = annotation.end
  let bestScore
  for(let i = 0; i < text.length; i++) {
    let editDistance = levenshtein(annotation.text.substr(0, MAX_LEN), text.substr(i, Math.min(MAX_LEN, annotation.text.length)))
    let beginDistance = Math.abs(annotation.begin - i)
    let score = 100 / (1 + 1000 * editDistance / annotation.text.length + beginDistance / 1000)

    if (!bestScore || score > bestScore) {
      // console.log("bestBegin", { bestBegin, oldBegin: annotation.begin, editDistance, score, l: [annotation.text.substr(0, MAX_LEN), text.substr(i, Math.min(MAX_LEN, annotation.text.length))] })
      bestScore = score
      bestBegin = i
    }
  }
  let offset = Math.max(0, Math.ceil(annotation.text.length - annotation.text.length / 2))
  if (offset > 3) {
    bestScore = undefined
    for(let i = bestBegin - 30;
        i < Math.min(text.length - offset, bestBegin + 30);
        i++) {
      let editDistance = levenshtein(annotation.text.substr(offset), text.substr(i + offset, Math.min(MAX_LEN, annotation.text.length - offset)))
      let endDistance = Math.abs(annotation.end - i)
      let score = 10000 / (1 + 10000 * editDistance / annotation.text.length + endDistance / 10000)

      if (!bestScore || score > bestScore) {
        // console.log("bestEnd", { bestEnd, oldEnd: annotation.end, editDistance, score, l: [annotation.text.substr(offset), text.substr(i + offset, Math.min(MAX_LEN, annotation.text.length - offset))] })
        bestScore = score
        bestEnd = i + annotation.text.length
      }
    }
  } else {
    bestEnd += bestBegin - annotation.begin
  }

  let delta = bestBegin - annotation.begin
  if (delta !== 0) {
    // Fix another bug:
    // if (/^\s+/.test(annotation.text)) {
    //   while(/\s/.test(annotation.text[0]) && /\S/.test(text[annotation.end + delta])) {
    //     delta++
    //     bestBegin++
    //     annotation.text = text.slice(annotation.begin + delta, annotation.end + delta)
    //     console.log("Shift")
    //   }
    //   while(/\s/.test(annotation.text[0])) {
    //     delta++
    //     bestBegin++
    //     annotation.end--
    //     annotation.text = text.slice(annotation.begin + delta, annotation.end + delta)
    //     console.log("Unshift")
    //   }
    // }
    console.log("l", annotation.text.length, text.length)
    console.log(`[Score: ${Math.round(bestScore)}] Moving by ${delta}: [${annotation.type}]`, dump(annotation.text), "from", dump(text.slice(annotation.begin, annotation.end)), `[${annotation.begin}..${annotation.end}]`, "to", dump(text.slice(bestBegin, bestEnd)), `[${bestBegin}..${bestEnd}]`)

    annotation.begin = bestBegin
    annotation.end = bestEnd
    let req = {
      index: 'annotations',
      type: 'text',
      id: annotation._id
    }
    delete annotation._id
    req.body = annotation
    if (writing) {
      elasticsearch.index(req, cb)
    } else {
      cb()
    }
  } else {
    cb()
  }
}
