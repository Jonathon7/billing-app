let Request = require("tedious").Request;

const getFees = (req, res, next, connection) => {
  let endRows;
  const request = new Request(
    `select * from ${process.env.feesTable}`,
    (err) => {
      if (err) {
        throw err;
      }
      connection.close();
    }
  );

  request.on("doneInProc", (rowCount, more, rows) => {
    endRows = rows;
  });

  request.on("requestCompleted", function () {
    console.log("Request Completed");
    res.status(200).json(endRows);
  });

  connection.execSql(request);
};

const addFee = (req, res, next, connection) => {
  console.log(req.body);

  const request = new Request(
    `insert into ${process.env.feesTable}(Name, Amount) values('${req.body.name}', ${req.body.amount});`,
    (err) => {
      if (err) {
        throw err;
      }
      connection.close();
    }
  );

  request.on("requestCompleted", function () {
    console.log("Request Completed");
    res.status(200).json("Fee Added.");
  });

  connection.execSql(request);
};

module.exports = {
  getFees,
  addFee,
};
