const { app } = require("./app.js");

app()
  .then(() => {
    console.log("[App exitted gracefully]");
  })
  .catch((reason) => {
    console.error("[App exitted with error]", reason);
  });
