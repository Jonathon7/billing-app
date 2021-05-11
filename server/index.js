require("dotenv").config();
const express = require("express");
const { json } = require("body-parser");
let session = require("express-session");
const cors = require("cors");
const { login } = require("./controllers/loginController");
const { openDbConnection } = require("./database");
const {
  getCustomers,
  addCustomer,
  checkForExistingCustomer,
  updateCustomer,
} = require("./controllers/customerController");
const {
  getLocations,
  updateLocation,
  checkForExistingLocation,
  addLocation,
} = require("./controllers/locationController");
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
app.get("/api/get-customers", (req, res, next) =>
  openDbConnection(req, res, next, getCustomers)
);

app.put("/api/update-customer", (req, res, next) => {
  openDbConnection(req, res, next, updateCustomer);
});

app.post(
  "/api/add-customer",
  (req, res, next) =>
    openDbConnection(req, res, next, checkForExistingCustomer),
  (req, res, next) => openDbConnection(req, res, next, addCustomer)
);

// interacts with AS400 db
// app.post("/api/insert-customer", (req, res, next) =>
//   openAS400DbConnection(req, res, next, addCustomer)
// );

// Location form
app.get("/api/get-locations", (req, res, next) =>
  openDbConnection(req, res, next, getLocations)
);

app.post(
  "/api/add-location",
  (req, res, next) =>
    openDbConnection(req, res, next, checkForExistingLocation),
  (req, res, next) => openDbConnection(req, res, next, addLocation)
);

app.put("/api/update-location", (req, res, next) =>
  openDbConnection(req, res, next, updateLocation)
);

// interacts with AS400 db
// app.post("/api/insert-location", (req, res, next) =>
//   openAS400DbConnection(req, res, next, addLocation)
// );

// Fees form
app.get("/api/get-fees", (req, res, next) =>
  openDbConnection(req, res, next, getFees)
);

app.put("/api/update-fee-amount", (req, res, next) =>
  openDbConnection(req, res, next, updateFeeAmount)
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

app.get("/api/get-transactions/:startDate/:endDate", (req, res, next) => {
  openDbConnection(req, res, next, getTransactions);
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
