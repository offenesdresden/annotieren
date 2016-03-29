'use strict'

module.exports.Forbidden = class Forbidden extends Error {
  get statusCode() {
    return 403
  }
}

module.exports.NotFound = class NotFound extends Error {
  get statusCode() {
    return 404
  }
}

module.exports.write = function(error, res) {
  res.writeHead(error.statusCode || 500, {
    'Content-Type': 'application/json'
  })
  res.write(JSON.stringify({ error: error.message }))
  res.end()
}
