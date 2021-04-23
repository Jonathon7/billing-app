import React from "react";
import axios from "axios";
import "./customer.css";
import "../index.css";

export default class Customer extends React.Component {
  state = {
    id: "",
    name: "",
    newName: "",
    newId: "",
    emptyFields: [], // will specify which input are empty
  };

  handleChange = (e) => {
    // test to allow only numbers
    const regex = /^[0-9\b]+$/;

    if (
      e.target.value === "" ||
      (regex.test(e.target.value) && e.target.name === "id")
    ) {
      this.setState({
        id: e.target.value,
      });
    } else {
      this.setState({
        [e.target.name]: e.target.value,
      });
    }
  };

  handleSubmit = () => {
    if (this.state.emptyFields.length) {
      console.log(this.state.emptyFields);
      return;
    }

    axios.get(`/api/get-customer-name/${this.state.id}`).then((res) => {
      console.log(res);
      if (res.data === "Customer not found.") {
        this.getCustomerInfo();
      } else {
        console.log(res);
        this.setState({ id: res.data.id, name: res.data.name });
      }
    });
  };

  /**
   * @description - function gets called when the customer does not exist in TRASH db and needs to be pulled from AS400 db
   */
  getCustomerInfo = () => {
    axios
      .post(`/api/insert-customer`, {
        id: this.state.id,
        confirm: true,
      })
      .then((res) => {
        if (res.data[0]) {
          this.setState({ confirmation: true, name: res.data[0] });
        } else {
          // NOTIFICATION: Customer does not exist
        }
      });
  };

  addCustomer = (e) => {
    e.preventDefault();

    axios
      .post("/api/add-customer", {
        id: this.state.newId,
        name: this.state.newName,
      })
      .then((res) => {
        console.log(res);
      });
  };

  // handles the yes or no response that the user selects in the confirmation form. **** NEEDS NOTIFICATION ****
  handleConfirmationForm = (yes) => {
    if (yes) {
      axios
        .post("/api/insert-customer", {
          id: this.state.id,
          confirm: false,
        })
        .then((res) => {
          if (res.data[0] != "") {
            this.setState({
              name: "",
              id: "",
              confirmation: false,
            });
          }
        });
    } else {
      this.setState({ id: "", name: "", confirmation: false });
    }
  };

  /**
   * @description - checks for empty fields that are required and concatenates them in a string so that error indications can be rendered for the user
   */
  checkForEmptyFields = (e) => {
    e.preventDefault();
    let emptyFields = this.state.emptyFields;
    if (this.state.id === "") {
      emptyFields.push("id");
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
      <div className="customer-form">
        <h1>Find a Customer</h1>
        <form onSubmit={this.checkForEmptyFields}>
          <input
            type="text"
            onChange={this.handleChange}
            value={this.state.id}
            name="id"
            placeholder="Enter customer ID"
            style={{ border: this.isFieldEmpty("id") && "solid 1px red" }}
            onFocus={this.removeEmptyField}
          ></input>
          <input
            type="submit"
            className="black-button-white-text"
            value="Search"
          ></input>
        </form>

        {this.state.name && (
          <div>
            <p>Name: {this.state.name}</p>
            <p>ID: {this.state.id}</p>
          </div>
        )}
        <p>Add a Customer</p>
        <form onSubmit={this.addCustomer}>
          <input
            type="text"
            placeholder="ID"
            name="newId"
            onChange={this.handleChange}
          ></input>
          <input
            type="text"
            placeholder="Name"
            name="newName"
            onChange={this.handleChange}
          ></input>

          <input type="submit"></input>
        </form>
      </div>
    );
  }
}
