let Request = require("tedious").Request;

const insertContainer = (req, res, next, connection) => {
  const {
    cubicYard,
    type,
    cityOwned,
    inStock,
    returnedToStockDate,
    location,
    comment,
  } = req.body;

  const request = new Request(
    `insert into ${process.env.containerTable} (CubicYard, Type, CityOwned, InStock, ReturnedToStockDate, Location, Comment) values ('${cubicYard}', '${type}', ${cityOwned}, ${inStock}, '${returnedToStockDate}', '${location}', '${comment}');`,
    (err) => {
      if (err) {
        throw err;
      }
      connection.close();
    }
  );

  request.on("requestCompleted", function () {
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

const updateContainer = (req, res, next, connection) => {
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
    `update ${process.env.containerTable} set CubicYard =${cubicYard}, Type =${type}, CityOwned=${cityOwned}, InStock=${inStock}, ReturnedToStockDate=${returnedToStockDate}, Location=${location}, Comment=${comment} where containerId=${containerId}`,
    (err) => {
      if (err) {
        throw err;
      }
      connection.close();
    }
  );

  request.on("requestCompleted", function () {
    res.status(200).json("Row Updated.");
  });

  connection.execSql(request);
};

module.exports = {
  insertContainer,
  getContainer,
  updateContainer,
};
