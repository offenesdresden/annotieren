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
  * login_store: provide actions/state to navigation & annotate_bar visibility
  * refactor login out of navigation
  * paper_view: fix speaker in record
  * paper_view: multiple votes
  * paper_view: more refs, inline
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
* Backend:
  * Cache headers for production
  * journaling
  * auth, sessions with https://github.com/mozilla/node-client-sessions
  * annotations aggregations by file for pretty badges
* Navigation:
  * Meistannotierte
  * Selten annotierte
  * Kürzlich annotierte
  * Neue Dokumente
  * Suche (Facets?)

