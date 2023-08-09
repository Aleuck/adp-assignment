const { runTopEarner } = require("./app.js");

runTopEarner()
  .then(() => {
    console.log("[App exitted gracefully]");
  })
  .catch((reason) => {
    console.error("[App exitted with error]", reason);
  });
