# How to use

* clone repository
* npm install
  * if error 127 occur: $ sudo apt-get install nodejs-legacy
* [Populate ES index ratsinfo](https://github.com/astro/democropticon/tree/master/elasticsearch-upload) from [Ratsinfo-scraped](https://github.com/offenesdresden/ratsinfo-scraper) data
* ```shell
for f in `find /mnt/ratsinfo -name \*.pdf`; do
    echo $f;pdftohtml -s -i $f $(basename $f .pdf)
done
```


# TODO

* Backend:
  * pdf2html: <b> & page breaks
  * auth
  * search, filter doc by annotations
  * annotations repo
* Deleting annotations
* Navigation:
  * Meistannotierte
  * Selten annotierte
  * Kürzlich annotierte
  * Neue Dokumente
  * Suche (Facets?)
* Style

