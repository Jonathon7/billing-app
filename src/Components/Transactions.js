import React from "react";
import "./transactions.css";
import axios from "axios";
import Fees from "./Fees";

export default class Transactions extends React.Component {
  state = {
    customerId: "",
    locationId: "",
    containerNumber: "",
    TNRCCFeeCharge: "",
    landFillTonnage: "",
    ton: "",
    billItems: [],
    fees: {}, // contains any amounts relevant for calculated fields
    emptyFields: [],
  };

  componentDidMount() {
    this.getFees();
  }

  // TODO: should not add additional fees on tonnage change, but it should update the amount. Also when a transaction is submitted, this function gets called again and adds these fees with blank amounts. it should not do this
  componentDidUpdate(prevProps, prevState) {
    if (prevState.ton != this.state.ton) {
      this.addBillItem({
        name: "TNRCC FEE CHARGE",
        id: 5,
        amount: (this.state.ton * this.state.TNRCCFeeCharge).toFixed(2),
      });

      this.addBillItem({
        name: "LANDFILL TONNAGE",
        id: 4,
        amount: (this.state.ton * this.state.landFillTonnage).toFixed(2),
      });
    }
  }

  /**
   * @description - retrieves all fees needed for calculated fields and sets the calculated fields to state
   */
  getFees = () => {
    axios
      .get("/api/get-fees")
      .then((res) => {
        const TNRCCFeeCharge = res.data.find((elem) => {
          return elem[1].value === "TNRCC FEE CHARGE";
        })[2].value;

        const landFillTonnage = res.data.find((elem) => {
          return elem[1].value === "LANDFILL TONNAGE";
        })[2].value;

        this.setState({
          TNRCCFeeCharge,
          landFillTonnage,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  handleChange = (e) => {
    // test to allow only numbers
    const regex = /^[0-9\b]+$/;
    if (
      e.target.name === "customerId" ||
      e.target.name === "locationId" ||
      e.target.name === "containerNumber" ||
      e.target.name === "ton"
    ) {
      if (e.target.value === "" || regex.test(e.target.value)) {
        this.setState({
          [e.target.name]: e.target.value,
        });
      }
    } else {
      this.setState({
        [e.target.name]: e.target.value,
      });
    }
  };

  handleSubmit = async () => {
    const { customerId, locationId, containerNumber, billItems } = this.state;

    for (let i = 0; i < billItems.length; i++) {
      let data = {
        customerId,
        locationId,
        containerNumber,
        billItem: billItems[i],
      };
      await axios
        .post("/api/insert-transaction", data)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
    }

    this.setState({
      customerId: "",
      locationId: "",
      containerNumber: "",
      TNRCCFeeCharge: "",
      landFillTonnage: "",
      ton: "",
      billItems: [],
      fees: {},
    });
  };

  addBillItem = (item) => {
    const billItems = this.state.billItems;
    billItems.push(item);

    this.setState(
      {
        billItems,
      },
      () => {
        let sum = 0;
        // adds all bill item amounts
        for (let i = 0; i < billItems.length; i++) {
          sum += parseFloat(billItems[i].amount);
        }

        this.setState({
          chargeAmount: sum,
        });
      }
    );
  };

  /**
   * @param {object} change - contains the id, name, and the amount of the fee. The id is used to query and the amount is what is updated. The user can only change the amount of the fee and never the name.
   */
  changeFeeAmount = (change) => {
    axios.put("/api/update-fee-amount", change).then((res) => console.log(res));
  };

  /**
   * @description - checks for empty fields that are required and concatenates them in a string so that error indications can be rendered for the user
   */
  checkForEmptyFields = (e) => {
    e.preventDefault();
    let emptyFields = this.state.emptyFields;
    if (this.state.customerId === "") {
      emptyFields.push("customerId");
    }

    if (this.state.locationId === "") {
      emptyFields.push("locationId");
    }

    if (this.state.containerNumber === "") {
      emptyFields.push("containerNumber");
    }

    if (this.state.ton === "") {
      emptyFields.push("ton");
    }

    this.setState(
      {
        emptyFields,
      },
      () => this.handleSubmit()
    );
  };

  /**
   * @description - removes the field from the emptyFields array
   */
  removeEmptyField = (e) => {
    const emptyFields = this.state.emptyFields;
    let idx;
    for (let i = 0; i < emptyFields.length; i++) {
      if (emptyFields[i] === e.target.name) {
        idx = i;
      }
    }

    emptyFields.splice(idx, 1);
    this.setState({ emptyFields });
  };

  isFieldEmpty = (name) => {
    const emptyFields = this.state.emptyFields;

    for (let i = 0; i < emptyFields.length; i++) {
      if (emptyFields[i] === name) {
        return true;
      }
    }

    return false;
  };

  render() {
    return (
      <div className="transaction-cont">
        <div className="transaction-cont-header">
          <h1>Create a Transaction</h1>
          {this.state.chargeAmount && (
            <p>Charge Amount: ${this.state.chargeAmount.toFixed(2)}</p>
          )}
        </div>
        <div className="transaction-inner-cont">
          <form
            onSubmit={this.checkForEmptyFields}
            className="transaction-form"
          >
            <label htmlFor="container-id">Customer ID:</label>
            <input
              onChange={this.handleChange}
              name="customerId"
              value={this.state.customerId}
              onFocus={this.removeEmptyField}
              style={{
                border: this.isFieldEmpty("customerId") && "red solid 1px",
              }}
            ></input>

            <label htmlFor="location-id">Location ID:</label>
            <input
              onChange={this.handleChange}
              name="locationId"
              value={this.state.locationId}
              onFocus={this.removeEmptyField}
              style={{
                border: this.isFieldEmpty("locationId") && "red solid 1px",
              }}
            ></input>

            <label htmlFor="container-id">Container Number:</label>
            <input
              onChange={this.handleChange}
              name="containerNumber"
              value={this.state.containerNumber}
              onFocus={this.removeEmptyField}
              style={{
                border: this.isFieldEmpty("containerNumber") && "red solid 1px",
              }}
            ></input>

            <label htmlFor="ton">TON: </label>
            <input
              value={this.state.ton}
              name="ton"
              onChange={this.handleChange}
              onFocus={this.removeEmptyField}
              style={{ border: this.isFieldEmpty("ton") && "red solid 1px" }}
            ></input>

            {this.state.ton && (
              <>
                <label htmlFor="solid-waste-charge">Landfill Tonnage: </label>
                <input
                  readOnly
                  value={(this.state.landFillTonnage * this.state.ton).toFixed(
                    2
                  )}
                ></input>
                <label htmlFor="TNRCCF-fee-charge">TNRCC FEE CHARGE:</label>
                <input
                  readOnly
                  value={(this.state.TNRCCFeeCharge * this.state.ton).toFixed(
                    2
                  )}
                ></input>
              </>
            )}

            <input type="submit" className="black-button-white-text"></input>
          </form>

          <div className="transaction-fees-cont">
            <p>Add Fees</p>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Fees
                handleSubmit={this.addBillItem}
                buttonText="Add Fee"
                feeNameText="Enter Name of Fee"
                feeAmountText="Fee Amount"
              />
            </div>

            <div className="transaction-fees-list">
              {this.state.billItems.map((elem, index) => {
                return (
                  <div
                    key={index}
                    className="transaction-fee"
                    style={{
                      background: index % 2 === 0 ? "white" : "#f1f1f1",
                    }}
                  >
                    <p>Bill Item {index + 1}:</p>
                    <p>
                      {elem.name}, ${elem.amount}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* <div>
          <p>Change Fee Amount</p>
          <Fees handleSubmit={this.changeFeeAmount} />
        </div> */}
      </div>
    );
  }
}
