const { groupByEmployeeWithFilter, processTask } = require("./processTask.js");
const { mergeDeepRight } = require("ramda");
jest.useFakeTimers({
  now: new Date("2023-08-08").getTime(),
});

/**
 * @typedef Employee
 * @type {import("./processTask.js").Employee}
 *
 * @typedef APITransaction
 * @type {import("./api.js").APITransaction}
 *
 * @typedef APITask
 * @type {import("./api.js").APITask}
 *
 * @typedef APITaskResult
 * @type {import("./api.js").APITaskResult}
 */

/**
 * @param {Partial<APITransaction>} partialTrans
 * @returns {APITransaction}
 */
const createTransaction = (partialTrans) => {
  const baseTrans = {
    transactionID: "TX_001",
    timeStamp: "2022-02-09T19:58:16.468Z",
    amount: 1000,
    type: "alpha",
    location: { name: "New York, New York", id: "L027145" },
    employee: {
      name: "Ahmed Shah",
      id: "RFT498",
      categoryCode: "green",
    },
  };
  return mergeDeepRight(baseTrans, partialTrans);
};

describe("groupByEmployeeWithFilter", () => {
  it("empty output for empty input", () => {
    const actual = groupByEmployeeWithFilter([]);
    expect(actual.size).toBe(0);
  });

  it("correctly transforms data for a single transaction", () => {
    const result = groupByEmployeeWithFilter([
      createTransaction({
        transactionID: "TX_041",
        type: "beta",
        amount: 123,
        employee: {
          id: "GYH001",
          name: "Mimi Keboli",
        },
      }),
    ]);

    /** @type {Map<string,Employee>} */
    const expected = new Map();
    expected.set("GYH001", {
      id: "GYH001",
      name: "Mimi Keboli",
      totalAmount: 123,
      transactions: [
        {
          id: "TX_041",
          type: "beta",
          amount: 123,
        },
      ],
    });
    expect(result).toEqual(expected);
  });

  it("creates separate entries for different employees", () => {
    const transactions = [
      createTransaction({
        transactionID: "TX_1",
        type: "beta",
        amount: 123,
        employee: {
          id: "EMP01",
          name: "Mimi Keboli",
        },
      }),
      createTransaction({
        transactionID: "TX_2",
        type: "alpha",
        amount: 321,
        employee: {
          id: "EMP02",
          name: "Keboli Mimi",
        },
      }),
    ];
    const result = groupByEmployeeWithFilter(transactions);

    /** @type {Map<string,Employee>} */
    const expected = new Map();
    expected.set("EMP01", {
      id: "EMP01",
      name: "Mimi Keboli",
      totalAmount: 123,
      transactions: [
        {
          id: "TX_1",
          type: "beta",
          amount: 123,
        },
      ],
    });
    expected.set("EMP02", {
      id: "EMP02",
      name: "Keboli Mimi",
      totalAmount: 321,
      transactions: [
        {
          id: "TX_2",
          type: "alpha",
          amount: 321,
        },
      ],
    });
    expect(result).toEqual(expected);
  });

  it("sum entries of same employee", () => {
    const transactions = [
      createTransaction({
        transactionID: "TX_1",
        type: "beta",
        amount: 123,
        employee: {
          id: "EMP01",
          name: "Mimi Keboli",
        },
      }),
      createTransaction({
        transactionID: "TX_2",
        type: "alpha",
        amount: 321,
        employee: {
          id: "EMP01",
          name: "Mimi Keboli",
        },
      }),
    ];
    const result = groupByEmployeeWithFilter(transactions);
    /** @type {Map<string,Employee>} */
    const expected = new Map();
    expected.set("EMP01", {
      id: "EMP01",
      name: "Mimi Keboli",
      totalAmount: 444,
      transactions: [
        {
          id: "TX_1",
          type: "beta",
          amount: 123,
        },
        {
          id: "TX_2",
          type: "alpha",
          amount: 321,
        },
      ],
    });
    expect(result).toEqual(expected);
  });
});

describe("processTask", () => {
  it("returns correct task id", () => {
    /** @type {APITask} */
    const emptyTask = {
      id: "MY_TEST_ID_123",
      transactions: [],
    };
    const result = processTask(emptyTask);
    expect(result.id).toBe(emptyTask.id);
  });

  it("filters out non-alpha transactions", () => {
    /** @type {APITask} */
    const input = {
      id: "TEST_ID",
      transactions: [
        createTransaction({
          type: "beta",
        }),
      ],
    };
    /** @type {APITaskResult} */
    const expectedOutput = {
      id: "TEST_ID",
      result: [],
    };
  });

  it("keeps alpha transactions", () => {
    /** @type {APITask} */
    const input = {
      id: "TEST_ID",
      transactions: [
        createTransaction({
          transactionID: "TRANS_ID",
          type: "alpha",
        }),
      ],
    };
    /** @type {APITaskResult} */
    const expectedOutput = {
      id: "TEST_ID",
      result: ["TRANS_ID"],
    };
    const result = processTask(input);
    expect(result).toEqual(expectedOutput);
  });

  it("discards transactions that are not from last calendar year", () => {
    /** @type {APITask} */
    const input = {
      id: "TEST_ID",
      transactions: [
        createTransaction({
          transactionID: "TRANS_ID",
          type: "alpha",
          timeStamp: "2023-01-09T19:58:16.468Z",
        }),
        createTransaction({
          transactionID: "TRANS_ID",
          type: "alpha",
          timeStamp: "2021-01-09T19:58:16.468Z",
        }),
      ],
    };
    /** @type {APITaskResult} */
    const expectedOutput = {
      id: "TEST_ID",
      result: [],
    };
    const result = processTask(input);
    expect(result).toEqual(expectedOutput);
  });
});
