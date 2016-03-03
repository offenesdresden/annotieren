'use strict'

var express = require('express')
var app = express()
var CONF = require('../config.js')

app.use(require('compression')())
app.use('/api', require('./api')(CONF))
app.use(express.static(`${__dirname}/../../public`))

app.listen(CONF.http_port, function() {
    console.log(`Now listening on http://localhost:${CONF.http_port}/`)
})
