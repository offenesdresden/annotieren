#!/bin/bash -e

curl -XDELETE 'http://localhost:9200/ratsinfo/'
curl -XPUT 'http://localhost:9200/ratsinfo/' -d '@es_mapping.json'
