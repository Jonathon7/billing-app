let Request = require("tedious").Request;
var asyncjs = require("async");

/**
 * @description - If the customer's id exists in the db, then the whole row is sent as a response.
 */
const getCustomerName = (req, res, next, connection) => {
  let result;
  const request = new Request(
    `select * from ${process.env.customerTable} where CustomerId = ${req.params.id}`,
    (err) => {
      if (err) {
        throw err;
      }
      connection.close();
    }
  );
  request.on("doneInProc", (rowCount, more, rows) => {
    if (rows[0]) {
      result = { id: rows[0][0].value, name: rows[0][1].value };
    }
  });
  request.on("requestCompleted", function () {
    // if customer id did not exist in db
    if (!result) {
      connection.close();
      res.status(200).json("Customer not found.");
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
const addCustomer = (req, res, next, ibmi) => {
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
                  `SELECT ${process.env.nav}.UTCSNM, ${process.env.nav}.UTCSST FROM ${process.env.nav} WHERE ${process.env.nav}.UTCSID =${req.body.id}`,
                  function (err, resultset) {
                    if (err) {
                      callback(err);
                    } else {
                      // Convert the result set to an object array.
                      resultset.toObjArray(function (err, results) {
                        if (Array.isArray(results) && results.length) {
                          const col1 = results.map((c1) => c1.UTCSNM.trim());
                          const col2 = results.map((c2) => c2.UTCSST.trim());
                          formattedResults = [col1, col2];
                        }
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
                    `insert into ${process.env.customerTable} (CustomerId, Name) values(${req.body.id}, '${formattedResults[0]}')`,
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
                res.status(200).json(formattedResults[0]);
              }
            }
          });
        }
      );
    }
  });
};

module.exports = {
  getCustomerName,
  addCustomer,
};
