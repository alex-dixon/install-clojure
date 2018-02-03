#!/usr/bin/env node
const { main } = require("./index")

main()
  .then(() => console.log('Exiting'))
  .catch(e => console.error("error", e))
