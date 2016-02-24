'use strict'

const CONF = {
  http_port: 3000,

  resources: {
    htmlUrl: (docId) => `https://dresden.spaceboyz.net/ratsinfo-html/${docId}-html.html`,
    // htmlUrl: (docId) => "https://dresden.spaceboyz.net/ratsinfo-html/00220058-html.html",

    elasticsearch: "https://es:Capt9slofO@dresden.spaceboyz.net/es/"
  }
}

var express = require('express')
var app = express()

app.use(require('compression')())
app.use('/api', require('./api')(CONF))
app.use(express.static(`${__dirname}/../../public`))

app.listen(CONF.http_port, function() {
    console.log(`Now listening on http://localhost:${CONF.http_port}/`)
})
