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

* Ideas:
  * Navigation: as toolbar with Home, Current context, Logout
  * location metadata with map
  * Update to Reactv15
  * Per person summaries
* Frontend:
  * paper_view: multiple speakers
  * paper_view: fix http://localhost:3000/paper/8268 http://localhost:3000/file/175634
  * annotate_bar: delete button in top toolbar
  * paper_view: show all refs if file pertains only to this paper
  * create annotations: auto-rm white-space
  * annotate_bar: fix hint suggestion search input overwriting
  * doc_text: progressive loading
  * paper_view: more refs, inline, render refs per paragraph
  * Fix: display of stacked annotations with equal begin offset
  * Cycle thru stack o' annotations by repeated clicking
  * doc_view: metadata/context? eg. agendaItems
  * paper view: more info, more pretty, maps
  * Provide raw exports
  * Favicon
  * paper_view optimization: /api/file/241251/annotations/${paper.id}
  * search: completion
  * paper_view: more like this
  * paper_view vote: pie chart
* Backend:
  * Highscore agg not with terms but full ids
  * Find stale annotations that were created prior text reordering
  * Cache headers for production
  * journaling
  * annotations aggregations by file for pretty badges
* Navigation:
  * Suchen (Facets?): no results by default
  * Neue Dokumente
  * Kürzlich annotierte
  * Meistannotierte
  * Selten annotierte

