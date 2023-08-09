/**
 * @typedef Employee
 * @type {object}
 * @property {string} id
 * @property {string} name
 * @property {number} totalAmount
 * @property {Transaction[]} transactions
 */

/**
 * @typedef Transaction
 * @type {object}
 * @property {string} id
 * @property {string} type
 * @property {number} amount
 */

/**
 * @callback TransactionsFilter
 * @param {import("./api.js").APITransaction} transaction
 * @returns {boolean}
 */

/**
 * Groups transactions by employee, optionally filters the transaction with given function
 * @param {import("./api.js").APITransaction[]} transactions
 * @param {TransactionsFilter} [filter]
 * @returns {Map<string,Employee>}
 */
const groupByEmployeeWithFilter = (transactions, filter) => {
  const mapByEmployee = new Map();

  transactions.forEach((trans) => {
    if (filter && !filter(trans)) return;

    const { transactionID, amount, type } = trans;

    /** @type {Transaction} */
    const extractedTrans = {
      id: transactionID,
      amount,
      type,
    };

    const employeeId = trans.employee.id;
    const employee = mapByEmployee.get(employeeId) ?? {
      id: employeeId,
      name: trans.employee.name,
      totalAmount: 0,
      transactions: [],
    };

    employee.totalAmount += amount;
    employee.transactions.push(extractedTrans);
    mapByEmployee.set(employeeId, employee);
  });

  return mapByEmployee;
};

/**
 * Solves the interview task
 * @param {import("./api.js").APITask} task
 * @returns {import("./api.js").APITaskResult}
 */
const processTask = (task) => {
  const priorYear = new Date().getUTCFullYear() - 1;

  const employees = groupByEmployeeWithFilter(
    task.transactions,
    ({ timeStamp }) => Number(timeStamp.slice(0, 4)) === priorYear
  );

  /** @type {Employee} */
  let selectedEmp;
  let largestTotalAmount = 0;

  employees.forEach((emp) => {
    if (emp.totalAmount >= largestTotalAmount) {
      largestTotalAmount = emp.totalAmount;
      selectedEmp = emp;
    }
  });

  const alphaTrans = selectedEmp?.transactions
    .filter(({ type }) => type === "alpha")
    .map(({ id }) => id);

  return {
    id: task.id,
    result: alphaTrans ?? [],
  };
};

exports.groupByEmployeeWithFilter = groupByEmployeeWithFilter;
exports.processTask = processTask;
