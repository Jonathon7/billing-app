require("dotenv").config();
const express = require("express");
const { json } = require("body-parser");
let session = require("express-session");
const cors = require("cors");
const { login } = require("./controllers/loginController");
const { openDbConnection } = require("./database");
const { getCustomerName } = require("./controllers/customerController");
const { getLocation } = require("./controllers/locationController");
const { getFees, addFee } = require("./controllers/feesController");
const {
  insertContainer,
  getContainer,
  updateContainer,
} = require("./controllers/containerController");
const {
  getTransactions,
  insertTransaction,
  updateFeeAmount,
} = require("./controllers/transactionController");

const app = express();
app.use(json());
app.use(cors());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7 * 2, // 2 weeks
    },
  })
);

// Login form
app.post("/api/login", login);

// Customer form
app.get("/api/get-customer-name/:id", (req, res, next) =>
  openDbConnection(req, res, next, getCustomerName)
);

// interacts with AS400 db
// app.post("/api/insert-customer", (req, res, next) =>
//   openAS400DbConnection(req, res, next, addCustomer)
// );

// Location form
app.get("/api/get-location/:locationId", (req, res, next) =>
  openDbConnection(req, res, next, getLocation)
);

// interacts with AS400 db
// app.post("/api/insert-location", (req, res, next) =>
//   openAS400DbConnection(req, res, next, addLocation)
// );

// Fees form
app.get("/api/get-fees", (req, res, next) =>
  openDbConnection(req, res, next, getFees)
);

app.post("/api/add-fee", (req, res, next) =>
  openDbConnection(req, res, next, addFee)
);

// Container form
app.post("/api/insert-container", (req, res, next) =>
  openDbConnection(req, res, next, insertContainer)
);

app.put("/api/update-container", (req, res, next) =>
  openDbConnection(req, res, next, updateContainer)
);

app.get("/api/get-container/:containerIdSearch", (req, res, next) =>
  openDbConnection(req, res, next, getContainer)
);

// Transaction and Bill form
app.post("/api/insert-transaction", (req, res, next) =>
  openDbConnection(req, res, next, insertTransaction)
);

app.put("/api/update-fee-amount", (req, res, next) =>
  openDbConnection(req, res, next, updateFeeAmount)
);

app.get("/api/get-transactions/:startDate/:endDate", (req, res, next) => {
  openDbConnection(req, res, next, getTransactions);
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
