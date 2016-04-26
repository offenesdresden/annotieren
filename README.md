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
  * front_page: recent annotation with secondaryText, eg. user, time
  * search: completion
  * paper_view:
    * multiple speakers
      * first re-paragraph
      * then leave no ref/speaker behind
    * fix http://localhost:3000/paper/8268 http://localhost:3000/file/175634
    * Per person summaries in Popups
    * show all refs if file pertains only to this paper
    * more refs, inline, render refs per paragraph
    * more info, more pretty, maps
    * optimization: /api/file/241251/annotations/${paper.id}
    * more like this
    * pie chart
    * diffing annotation.text
    * suggest meetings with date
    * part onClick=go `/file/${fileId}#annotation-${annotationId}`
    * Timeline
  * doc_view:
    * create annotations: auto-rm white-space
    * Fix: display of stacked annotations with equal begin offset
    * Cycle thru stack o' annotations by repeated clicking
    * metadata/context? eg. agendaItems
    * keyboard control
  * fetch: declarative, progressive loading, updates pushed by service-worker
  * Provide raw exports
  * Favicon
  * Progressive Web App
  * OG/LD metadata in html header
  * Update to Reactv15
* Backend:
  * Highscore agg not with terms but full ids
  * Cache headers for production
  * Journaling/RecentChanges
  * annotations aggregations by file for pretty badges

