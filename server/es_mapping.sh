#!/bin/bash -e

curl -s -XDELETE 'http://localhost:9200/oparl/' > /dev/null
curl -s -XPUT 'http://localhost:9200/oparl/' -d '@es_mapping.json'
