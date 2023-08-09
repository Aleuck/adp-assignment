const fetch = require("node-fetch");
/**
 * @typedef APIEmployee
 * @type {object}
 * @property {string} name
 * @property {string} id
 * @property {string} categoryCode
 */

/**
 * @typedef APITransaction
 * @type {object}
 * @property {string} transactionID
 * @property {string} timeStamp
 * @property {number} amount
 * @property {string} type
 * @property {APIEmployee} employee
 */

/**
 * @typedef APITask
 * @type {object}
 * @property {string} id
 * @property {APITransaction[]} transactions
 */

/**
 * @typedef APITaskResult
 * @type {object}
 * @property {string} id
 * @property {string[]} result
 */

/**
 * Gets a task from the API
 * @returns {Promise<APITask>}
 */
const getTask = async () => {
  const response = await fetch("https://interview.adpeai.com/api/v2/get-task");
  return response.json();
};

const statusMessages = {
  200: "Success",
  400: "Incorrect value in result; no ID specified; value is invalid",
  404: "Value not found for specified ID",
  503: "Error communicating with database",
};

/**
 *
 * @param {} result
 * @returns
 */
const submitTask = async (result) => {
  const response = await fetch(
    "https://interview.adpeai.com/api/v2/submit-task",
    {
      method: "post",
      body: JSON.stringify(result),
      headers: { "Content-Type": "application/json" },
    }
  );

  const message =
    statusMessages[response.status] ?? `Unknown status ${response.status}`;

  const body = response.body.read().toString();
  const fullMessage = `${response.status} ${message}`;

  if (response.status !== 200) {
    return Promise.reject(`${fullMessage}\nbody:\n${body}`);
  } else {
    return fullMessage;
  }
};

exports.getTask = getTask;
exports.submitTask = submitTask;
