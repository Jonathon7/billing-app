let Request = require("tedious").Request;

const insertContainer = (req, res, next, connection) => {
  const {
    containerId,
    cubicYard,
    type,
    cityOwned,
    inStock,
    returnedToStockDate,
    location,
    comment,
  } = req.body;

  const request = new Request(
    `insert into ${process.env.containerTable} (ContainerId, CubicYard, Type, CityOwned, InStock, ReturnedToStockDate, Location, Comment) values (${containerId}, '${cubicYard}', '${type}', ${cityOwned}, ${inStock}, '${returnedToStockDate}', '${location}', '${comment}');`,
    (err) => {
      if (err) {
        throw err;
      }
      connection.close();
    }
  );

  request.on("requestCompleted", function () {
    console.log("Row Inserted.");
    res.status(200).json("Row Inserted.");
  });

  connection.execSql(request);
};

const getContainer = (req, res, next, connection) => {
  let result;
  const request = new Request(
    `select * from ${process.env.containerTable} where ContainerId = ${req.params.containerIdSearch}`,
    (err) => {
      if (err) {
        throw err;
      }
      connection.close();
    }
  );

  request.on("doneInProc", (rowCount, more, rows) => {
    if (rows[0]) {
      result = rows[0];
    }
  });

  request.on("requestCompleted", function () {
    res.status(200).json(result);
  });

  connection.execSql(request);
};

module.exports = {
  insertContainer,
  getContainer,
};
