'use strict'

var express = require('express')
var app = express()
var CONF = require('../config.js')

app.use(require('compression')())
app.use('/api', require('./api')(CONF))
var publicStatic = express.static(`${__dirname}/../../public`)
app.use(publicStatic)
app.use((req, res, next) => {
    // Redirect all remaining paths to the single-page app
    req.url = "/index.html"
    publicStatic(req, res, next)
})

app.listen(CONF.http_port, function() {
    console.log(`Now listening on http://localhost:${CONF.http_port}/`)
})
