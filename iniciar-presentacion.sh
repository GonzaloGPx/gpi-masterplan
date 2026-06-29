#!/usr/bin/env bash
# Lanzador desde la RAIZ del repo (Mac/Linux). Entra a Presentacion-AVSA y levanta el server.
cd "$(dirname "$0")/Presentacion-AVSA" || { echo "No encuentro Presentacion-AVSA junto a este script."; exit 1; }
URL="http://localhost:8123/demos/index.html"
( sleep 1; (command -v open >/dev/null && open "$URL") || (command -v xdg-open >/dev/null && xdg-open "$URL") ) >/dev/null 2>&1 &
node serve.js
