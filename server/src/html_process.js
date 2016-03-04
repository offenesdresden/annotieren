/**
 * SYNOPSIS
 *
 * Converts pdftohtml output to page fragments that can be serialized
 * as JSON.
 **/

'use strict'

let assert = require('assert')
let Transform = require('stream').Transform
let utf8stream = require('utf8-stream')
let sax = require('sax')

function parseStyle(text) {
  let styles = {}
  let m
  while((m = text.match(/\s*([^:]+):\s*([^;]+);(.*)/))) {
    styles[m[1]] = m[2]
    text = m[3]
  }
  return styles
}

function parseCSS(text) {
  let style = {}
  for(let rule of text.match(/[\s\/]*([^\{]+\{[^\}]+\})/g)) {
    let m = rule.match(/\s*([^\{]+)\{([^\}]+)\}/)
    style[m[1]] = parseStyle(m[2])
  }
  return style
}

const STACK_LEN_PAGE = 1
const STACK_LEN_P = 2
const STACK_LEN_SPAN = 3

class Processor extends Transform {
  constructor() {
    super({ objectMode: true })
    
    this.stack = []

    this.parser = sax.parser(false, {
      lowercase: true
    })
    // Don't terminate after first HTML fragment
    this.parser.write("<root>")
    for(let ev of ['onopentag', 'onclosetag', 'ontext', 'oncomment', 'onerror']) {
      this.parser[ev] = this[ev].bind(this)
    }
  }

  _transform(data, encoding, cb) {
    this.parser.write(data.toString('utf8'))
    cb()
  }

  _flush(cb) {
    this.parser.end()
    cb()
  }

  onopentag(tag) {
    switch(tag.name) {
    case 'body':
    case 'style':
      this.context = tag.name
      break
    case 'br':
      // Emulate <br/>
      this.ontext("\n")
      break
    case 'div':
    case 'p':
    case 'b':
      let el = {
        style: {},
        contents: []
      }
      if (tag.name === 'b') {
        el.style['font-weight'] = 'bold'
      }
      if (tag.attributes.class) {
        for(let class_ of tag.attributes.class.split(/\s+/g)) {
          let style = this.style["." + class_]
          if (style) {
            merge(el.style, style)
          }
        }
      }
      if (tag.attributes.style) {
        merge(el.style, parseStyle(tag.attributes.style))
      }
      if (isEmpty(el.style)) delete el.style
      this.stack.push(el)
      break
    }

    // Checks:
    switch(tag.name) {
    case 'div':
      assert.equal(this.stack.length, STACK_LEN_PAGE)
      break
    case 'p':
      assert.equal(this.stack.length, STACK_LEN_P)
      break
    case 'b':
      assert.equal(this.stack.length, STACK_LEN_SPAN)
      break
    }
  }

  onclosetag(name) {
    switch(name) {
    case 'body':
      this.context = null
      break
    case 'style':
      this.context = null
      this.style = parseCSS(this.css)
      this.css = ""
      break
    case 'div':
    case 'p':
    case 'b':
      let el = this.stack.pop()
      
      if (this.stack.length > 0) {
        this.stack[this.stack.length - 1].contents.push(el)
      } else {
        this.push(el)
      }
      break
    }
  }

  ontext(text) {
    if (this.context === 'style') {
      this.css = (this.css || "") + text
    }
    if (this.context === 'body' && this.stack.length >= STACK_LEN_P) {
      let elContents = this.stack[this.stack.length - 1].contents
      if (elContents.length > 0 &&
          typeof elContents[elContents.length - 1] === 'string') {

        elContents[elContents.length - 1] += text
      } else {
        elContents.push(text)
      }
    }
  }

  oncomment(text) {
    if (this.context === 'style') {
      this.css = (this.css || "") + text
    }
  }

  onerror(e) {
    console.error("Error:", e.message)
    this.emit('error', e)
  }
}


function merge(target, source) {
  for(var k in source) {
    target[k] = source[k]
  }
  return target
}

function isEmpty(obj) {
  for(var k in obj) {
    return false
  }
  return true
}


module.exports = function() {
  return new Processor()
}
