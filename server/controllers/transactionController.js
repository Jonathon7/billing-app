let Request = require("tedious").Request;

const insertTransaction = (req, res, next, connection) => {
  const { customerId, locationId, containerNumber, billItem } = req.body;
  console.log(req.body);

  const m = new Date();
  const date =
    m.getFullYear() +
    "/" +
    ("0" + (m.getMonth() + 1)).slice(-2) +
    "/" +
    ("0" + m.getDate()).slice(-2) +
    " " +
    ("0" + m.getHours()).slice(-2) +
    ":" +
    ("0" + m.getMinutes()).slice(-2) +
    ":" +
    ("0" + m.getSeconds()).slice(-2);

  const request = new Request(
    `insert into ${process.env.transactionsTable} (CustomerId, LocationId, ContainerId, FeeId, Name, Amount, TransactionDate) values (${customerId}, ${locationId}, ${containerNumber}, ${billItem.id}, '${billItem.name}', ${billItem.amount}, '${date}')`,
    (err) => {
      if (err) {
        throw err;
      }

      connection.close();
    }
  );

  connection.execSql(request);

  res.status(200).json("Rows Inserted.");
};

const getTransactions = (req, res, next, connection) => {
  let result;
  const { startDate, endDate } = req.params;

  const formattedStartDate =
    startDate.substring(0, 4) +
    startDate.substring(5, 7) +
    startDate.substring(8);

  const formattedEndDate =
    endDate.substring(0, 4) + endDate.substring(5, 7) + endDate.substring(8);

  const request = new Request(
    `select * from [Trash].[dbo].[Transactions] where TransactionDate >= '${formattedStartDate}' and TransactionDate <= '${formattedEndDate}'`,
    (err) => {
      if (err) {
        throw err;
      }

      connection.close();
    }
  );

  request.on("doneInProc", (rowCount, more, rows) => {
    result = rows;
    console.log("returned rows: ", rows);
  });

  request.on("requestCompleted", function () {
    res.status(200).json(result);
  });

  connection.execSql(request);
};

const updateFeeAmount = (req, res, next, connection) => {
  console.log(req.body);
  const request = new Request(
    `update ${process.env.feesTable} set Amount = ${req.body.amount} where FeeId = ${req.body.id}`,
    (err) => {
      if (err) {
        throw err;
      }

      connection.close();
    }
  );

  request.on("requestCompleted", function () {
    res.sendStatus(200);
  });

  connection.execSql(request);
};

module.exports = {
  insertTransaction,
  getTransactions,
  updateFeeAmount,
};
