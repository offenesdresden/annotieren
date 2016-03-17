# How to use

* clone repository
* `npm install`
  * if error 127 occurs: `apt-get install nodejs-legacy`
* `cd server`
  * `npm install`
  * Use `src/es_upload.js` to
    * populate ES index *oparl* from [Ratsinfo-scraped](https://github.com/offenesdresden/ratsinfo-scraper) data
    * apply pdftohtml


# TODO

* Frontend:
  * paper view
  * Consistent themeing
  * Provide raw exports
* Backend:
  * journaling
  * auth, sessions with https://github.com/mozilla/node-client-sessions
  * annotations aggregations by file for pretty badges
* Navigation:
  * Meistannotierte
  * Selten annotierte
  * Kürzlich annotierte
  * Neue Dokumente
  * Suche (Facets?)

