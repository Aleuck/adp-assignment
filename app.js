const { getTask, submitTask } = require("./src/api.js");
const { processTask } = require("./src/processTask.js");

const app = async () => {
  const task = await getTask();

  const result = await processTask(task);

  const message = await submitTask(result);

  console.log("Result: ", message);
};

exports.app = app;
