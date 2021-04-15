require("dotenv").config();
const express = require("express");
const { json } = require("body-parser");
const cors = require("cors");
const { openDbConnection, openAS400DbConnection } = require("./database");
const {
  getCustomerName,
  addCustomer,
} = require("./controllers/customerController");
const {
  getLocation,
  addLocation,
} = require("./controllers/locationController");
const { getFees, addFee } = require("./controllers/feesController");
const {
  insertContainer,
  getContainer,
} = require("./controllers/containerController");
const {
  getTransactions,
  insertTransaction,
  updateFeeAmount,
} = require("./controllers/transactionController");

const app = express();
app.use(json());
app.use(cors());

// Customer form
app.get("/api/get-customer-name/:id", (req, res, next) =>
  openDbConnection(req, res, next, getCustomerName)
);

app.post("/api/insert-customer", (req, res, next) =>
  openAS400DbConnection(req, res, next, addCustomer)
);

// Location form
app.get("/api/get-location/:locationId", (req, res, next) =>
  openDbConnection(req, res, next, getLocation)
);

app.post("/api/insert-location", (req, res, next) =>
  openAS400DbConnection(req, res, next, addLocation)
);

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
