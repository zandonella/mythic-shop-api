# mythic-shop-api

API to call locally with the league client open to get the mythic shop offerings and send data to web server

# Rough setup steps

- Download catalog.json from league client
- Make sure cd downloader is installed `npm i cd-dd -g`
- Run setup.sh until all assets are downloaded and you get "Command succeeded!"
- Run `node getTiles.js` to build all static tiles to local
- Run `node parse.js` to parse the catalog and pull out relevant data
