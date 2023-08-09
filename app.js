const { getTask, submitTask } = require("./src/api.js");
const { processTask } = require("./src/processTask.js");

const runTopEarner = async () => {
  const task = await getTask();

  const payload = await processTask(task);

  const message = await submitTask(payload);

  console.log("Result: ", message);
};

exports.runTopEarner = runTopEarner;
