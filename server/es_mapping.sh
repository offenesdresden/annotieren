#!/bin/bash -e

curl -XDELETE 'http://localhost:9200/oparl/'
curl -XPUT 'http://localhost:9200/oparl/' -d '@es_mapping.json'
