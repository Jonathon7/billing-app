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

  componentDidUpdate(prevProps, prevState) {
    if (prevState.ton != this.state.ton) {
      this.updateSetFeeAmounts();
    }
  }

  /**
   * @description - updates the TNRCC FEE CHARGE and the LANDFILL TONNAGE charges when the TON input is updated. It adds the bill items when they are not in the bill items array, it updates the items when the bill items are already in the array and the TON value is changed to a non-zero number. It removes the bill items when the TON input is changed to zero.
   */
  updateSetFeeAmounts = () => {
    const billItems = this.state.billItems;
    let chargeAmount = this.state.chargeAmount;
    let updated = false;

    // removes the fees if the TON input is zero
    if (!this.state.ton) {
      let idx1;
      let idx2;
      let amount1;
      let amount2;

      for (let i = 0; i < billItems.length; i++) {
        if (billItems[i].name === "TNRCC FEE CHARGE") {
          idx1 = i;
          amount1 = billItems[i].amount;
        }

        if (billItems[i].name === "LANDFILL TONNAGE") {
          amount2 = billItems[i].amount;
          idx2 = i;
        }
      }

      billItems.splice(idx1, 1);
      billItems.splice(--idx2, 1);

      chargeAmount -= parseFloat(amount1) + parseFloat(amount2);

      this.setState({ billItems, chargeAmount });
      return;
    }

    // if the fee is found and the TON input is not zero, then the amount will be updated
    for (let i = 0; i < billItems.length; i++) {
      if (billItems[i].name === "TNRCC FEE CHARGE") {
        billItems[i].amount = this.state.ton * this.state.TNRCCFeeCharge;
        updated = true;
      }

      if (billItems[i].name === "LANDFILL TONNAGE") {
        billItems[i].amount = this.state.ton * this.state.landFillTonnage;
      }
    }

    // function returns at this point and not at the end of the function so the bill items array will only be set to state on updated amount case and not on added fees case
    if (updated) {
      this.setState({ billItems });
      return;
    }

    // when the bill items are not in the array and need to be added
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
  };

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
    // test to allow only numbers or periods
    const regex2 = /^[0-9,.]*$/;
    if (
      e.target.name === "customerId" ||
      e.target.name === "locationId" ||
      e.target.name === "containerNumber"
    ) {
      if (e.target.value === "" || regex.test(e.target.value)) {
        this.setState({
          [e.target.name]: e.target.value,
        });
      }
    } else if (e.target.name === "ton") {
      if (e.target.value === "" || regex2.test(e.target.value))
        this.setState({
          [e.target.name]: e.target.value,
        });
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
