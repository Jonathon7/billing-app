let Request = require("tedious").Request;
var asyncjs = require("async");
// `select * from ${process.env.customerTable} where CustomerId = ${req.params.id}`
/**
 * @description - If the location id exists in the db, then the whole row is sent as a response.
 */
const getLocation = (req, res, next, connection) => {
  let result;
  const request = new Request(
    `select * from ${process.env.locationTable} where LocationId = ${req.params.locationId}`,
    (err) => {
      if (err) {
        throw err;
      }
      connection.close();
    }
  );
  request.on("doneInProc", (rowCount, more, rows) => {
    console.log(rows);
    if (rows[0]) {
      result = { id: rows[0][0].value, address: rows[0][2].value };
    }
  });
  request.on("requestCompleted", function () {
    // if location id did not exist in db
    if (!result) {
      connection.close();
      res.status(200).json("Location not found.");
    } else {
      res.status(200).json(result);
    }
  });

  connection.execSql(request);
};

/**
 * @description - gets called if the user does not exist in the TRASH db and needs to be pulled from AS400 db. It only executes a select statement if the user needs to first confirm that they want to insert the retrieved row in the TRASH db also. If the user confirms that they do want to make the entry, the function gets called again and the insert query gets executed.
 * @param {object} ibmi - db object from opening the AS400 db connection
 */
const addLocation = (req, res, next, ibmi) => {
  let formattedResults;
  ibmi.reserve(function (err, connObj) {
    if (connObj) {
      console.log("Using connection: " + connObj.uuid);

      var conn = connObj.conn;

      asyncjs.series(
        [
          function (callback) {
            conn.setAutoCommit(false, function (err) {
              if (err) {
                callback(err);
              } else {
                console.log("Autocommit Disabled");
                callback(null);
              }
            });
          },

          function (callback) {
            conn.setSchema(process.env.SCHEMA, function (err) {
              if (err) {
                callback(err);
              } else {
                callback(null);
              }
            });
          },
        ],
        function (err, results) {
          // Process result
        }
      );

      // Query the database.

      asyncjs.series(
        [
          function (callback) {
            // Select statement example.
            conn.createStatement(function (err, statement) {
              if (err) {
                callback(err);
              } else {
                statement.executeQuery(
                  `SELECT ${process.env.nav2}.ABABTX, ${process.env.nav2}.ABCHCD, ${process.env.nav2}.ABACCD, ${process.env.nav2}.ABAECD FROM ${process.env.nav2} WHERE ${process.env.nav2}.ABAUCD=${req.body.id}`,
                  function (err, resultset) {
                    if (err) {
                      callback(err);
                    } else {
                      // Convert the result set to an object array.
                      resultset.toObjArray(function (err, results) {
                        if (!results) {
                          return res
                            .status(200)
                            .json("Location does not exist.");
                        }

                        formattedResults = [
                          `${results[0].ABABTX} ${results[0].ABCHCD} ${results[0].ABACCD} ${results[0].ABAECD}`,
                        ];

                        callback(null, resultset);
                      });
                    }
                  }
                );
              }
            });

            //old
          },
        ],
        function (err, results) {
          ibmi.release(connObj, function (err) {
            if (err) {
              console.log(err.message);
            } else {
              if (!req.body.confirm) {
                var Connection = require("tedious").Connection;
                var config = {
                  server: process.env.IP,
                  authentication: {
                    type: "ntlm",
                    options: {
                      domain: process.env.DOMAIN,
                      userName: process.env.USER,
                      password: process.env.PASSWORD,
                    },
                  },
                  options: {
                    port: 1433, // Default Port
                    encrypt: false,
                    trustServerCertificate: true,
                    rowCollectionOnDone: true,
                  },
                };
                const connection = new Connection(config);
                connection.on("connect", (err) => {
                  if (err) {
                    console.log("Connection Failed");
                    throw err;
                  }

                  const request = new Request(
                    `insert into ${
                      process.env.locationTable
                    } (LocationId, AccountType, Address1, Address2) values(${
                      req.body.id
                    }, '${req.body.accountType}', '${req.body.address1}', '${
                      req.body.address2 === "" ? null : req.body.address2
                    }')`,
                    (err) => {
                      if (err) {
                        throw err;
                      }
                      connection.close();
                    }
                  );
                  request.on("requestCompleted", function () {
                    res.status(200).json(formattedResults[0]);
                  });
                  connection.execSql(request);
                  console.log("Connected to Database.");
                });
                connection.connect();
              } else {
                res.status(200).json(formattedResults);
              }
            }
          });
        }
      );
    }
  });
};

module.exports = {
  getLocation,
  addLocation,
};
