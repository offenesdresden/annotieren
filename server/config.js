'use strict'

var path = require('path')

module.exports = {
  http_port: 3000,

  scrapeData: path.join(__dirname, "/../../ratsinfo-scraper/data"),
  getHtmlPath: fileId =>
    `/mnt/ratsinfo/files/${fileId}.html`,

  elasticsearchUrl: "http://localhost:9200/",
  
  elasticsearchOparlIndex: "oparl",
  elasticsearchAuthIndex: "auth"
}
