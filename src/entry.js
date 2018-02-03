const {main} = require("./index")

main()
  .then(x => console.log('x', x))
  .catch(e => console.error("error", e))
