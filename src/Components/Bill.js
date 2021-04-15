import axios from "axios";
import React from "react";
import "./bill.css";

export default class Bill extends React.Component {
  state = {
    startDate: "",
    endDate: "",
    transactionsPerCustomer: [],
    emptyFields: [],
  };

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleSubmit = () => {
    if (this.state.emptyFields.length) {
      return;
    }
    axios
      .get(
        `/api/get-transactions/${this.state.startDate}/${this.state.endDate}`
      )
      .then((res) => {
        console.log(res.data);
        const data = res.data;
        const transactionsPerCustomer = [];

        for (let i = 0; i < data.length; i++) {
          let transaction = {};
          for (let j = 0; j < data[i].length; j++) {
            if (data[i][j].metadata.colName === "CustomerId") {
              transaction.id = data[i][j].value;
            }

            if (data[i][j].metadata.colName === "Amount") {
              transaction.amount = data[i][j].value;
            }
          }

          const customerExists = this.checkForCustomer(
            transaction.id,
            transactionsPerCustomer
          );

          if (customerExists) {
            console.log("HIT ", i);
            this.updateTransactionAmount(
              transaction.id,
              transaction.amount,
              transactionsPerCustomer
            );
          } else {
            transactionsPerCustomer.push(transaction);
          }
        }

        this.setState({
          transactionsPerCustomer,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  checkForCustomer = (id, transactionsPerCustomer) => {
    for (let idx = 0; idx < transactionsPerCustomer.length; idx++) {
      if (transactionsPerCustomer[idx].id === id) {
        return true;
      }
    }

    return false;
  };

  updateTransactionAmount = (id, amount, transactionsPerCustomer) => {
    for (let idx = 0; idx < transactionsPerCustomer.length; idx++) {
      if (transactionsPerCustomer[idx].id === id) {
        transactionsPerCustomer[idx].amount += amount;
        break;
      }
    }
  };

  /**
   * @description - checks for empty fields that are required and concatenates them in a string so that error indications can be rendered for the user
   */
  checkForEmptyFields = (e) => {
    e.preventDefault();
    let emptyFields = this.state.emptyFields;
    if (this.state.containerId === "") {
      emptyFields.push("startDate");
    }

    if (this.state.location === "") {
      emptyFields.push("endDate");
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
      <div className="bill-cont">
        <form onSubmit={this.checkForEmptyFields}>
          <label htmlFor="start-date">Start Date: </label>
          <input
            onChange={this.handleChange}
            name="startDate"
            onFocus={this.removeEmptyField}
            style={{
              border: this.isFieldEmpty("startDate") && "solid 1px red",
            }}
            type="date"
          ></input>
          <label htmlFor="end-date">End Date: </label>
          <input
            onChange={this.handleChange}
            onFocus={this.removeEmptyField}
            style={{ border: this.isFieldEmpty("endDate") && "solid 1px red" }}
            name="endDate"
            type="date"
          ></input>
          <input type="submit"></input>
        </form>
        <div>
          {this.state.transactionsPerCustomer.map((elem, idx) => {
            return (
              <div key={idx}>
                Customer {elem.id}: {elem.amount}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
