/**
 * @param req
 * @param res - req, res, and next are passed from the Express.js route handler to pass to the callback function. It is done this way because of the asynchrony of the tedious package
 * @param next
 * @param callback - The specific function that the route is to handle
 * @description - opens a db connection with the config object and passes it to the callback. Before the callback finishes executing or next is invoked, the db connection is always closed
 */

const openDbConnection = (req, res, next, callback) => {
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

    console.log("Connected to Database.");
    callback(req, res, next, connection);
  });

  connection.connect();
};

const openAS400DbConnection = (req, res, next, callback) => {
  //
  // node app.js <schema> <user> <password>
  //

  var JDBC = require("jdbc");

  var jinst = require("jdbc/lib/jinst");

  if (!jinst.isJvmCreated()) {
    jinst.addOption("-Xrs");

    jinst.setupClasspath(["./drivers/jt400.jar"]);
  }

  var server = process.env.AS400IP;

  var schema = process.env.SCHEMA;

  var user = process.env.AS400USER;

  var password = process.env.AS400PASSWORD;

  var config = {
    url: "jdbc:as400://" + server + "/" + schema,

    drivername: "com.ibm.as400.access.AS400JDBCDriver",

    minpoolsize: 10,

    maxpoolsize: 100,

    properties: {
      user: user,

      password: password,
    },
  };

  var ibmi = new JDBC(config);

  ibmi.initialize(function (err) {
    if (err) {
      console.log(err);
    } else {
      callback(req, res, next, ibmi);
      console.log("Connection initalized without error");
    }
  });
};

module.exports = {
  openDbConnection,
  openAS400DbConnection,
};
