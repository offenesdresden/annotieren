# How to use

* clone repository
* `npm install`
  * if error 127 occurs: `apt-get install nodejs-legacy`
* `cd server`
  * `npm install`
  * Use `src/es_upload.js` to
    * populate ES index *oparl* from [Ratsinfo-scraped](https://github.com/offenesdresden/ratsinfo-scraper) data
    * apply pdftohtml
  * `npm start` - then visit http://localhost:3000/

# TODO

* Frontend:
  * create annotations: auto-rm white-space
  * paper_view: more refs, inline, render refs per paragraph
  * Fix: display of stacked annotations with equal begin offset
  * Cycle thru stack o' annotations by repeated clicking
  * mediaquery: don't center doc_text in narrow windows
  * doc_view: metadata/context?
  * paper view: more info, more pretty, maps
  * Consistent themeing
  * Provide raw exports
  * Favicon
  * location metadata with map
  * paper_view optimization: /api/file/241251/annotations/${paper.id}
  * search: completion
* Backend:
  * Cache headers for production
  * journaling
  * annotations aggregations by file for pretty badges
* Navigation:
  * Suchen (Facets?): no results by default
  * Neue Dokumente
  * Kürzlich annotierte
  * Meistannotierte
  * Selten annotierte

