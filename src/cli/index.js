const path = require("path");

//
// This is where you can place your custom CLI tasks
// https://manual.os-js.org/guide/cli/
// https://manual.os-js.org/resource/official/
//

module.exports = {
  discover: [path.resolve(__dirname, "../packages")],
  tasks: [],
};
