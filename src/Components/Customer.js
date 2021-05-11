import React from "react";
import axios from "axios";
import "./customer.css";
import "../index.css";
import Confirmation from "./Confirmation";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import { createNotification } from "../utils/notifications";

export default class Customer extends React.Component {
  state = {
    id: "",
    name: "",
    newName: "", // when adding a customer
    newId: "", // adding id
    updatedCustomer: "",
    confirm: false,
    emptyFields: [], // will specify which inputs are empty
    customers: [],
  };

  componentDidMount() {
    this.getCustomers();
  }

  getCustomers = () => {
    axios
      .get("/api/get-customers")
      .then((res) => {
        let customers = [];

        for (let i = 0; i < res.data.length; i++) {
          let customer = {};
          customer.id = res.data[i][0].value;
          customer.name = res.data[i][1].value;

          customers.push(customer);
        }
        this.setState({ customers }, () => console.log(customers));
      })
      .catch((e) => {
        console.log(e);
      });
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
      return;
    }

    axios.get(`/api/get-customer-name/${this.state.id}`).then((res) => {
      this.setState({ id: res.data.id, name: res.data.name });

      createNotification(NotificationManager, "success", "Customer Found.");
    });
  };

  /**
   * @description - function gets called when the customer does not exist in TRASH db and needs to be pulled from AS400 db
   */
  // getCustomerInfo = () => {
  //   axios
  //     .post(`/api/insert-customer`, {
  //       id: this.state.id,
  //       confirm: true,
  //     })
  //     .then((res) => {
  //       if (res.data[0]) {
  //         this.setState({ confirmation: true, name: res.data[0] });
  //       } else {
  //         // NOTIFICATION: Customer does not exist
  //       }
  //     });
  // };

  addCustomer = (e) => {
    e.preventDefault();

    axios
      .post("/api/add-customer", {
        id: this.state.newId,
        name: this.state.newName,
      })
      .then((res) => {
        this.setState({ name: "", id: "" });
      });
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

    if (this.state.updatedCustomer === "" && this.state.confirm) {
      emptyFields.push("updatedCustomer");
    }

    this.setState(
      {
        emptyFields,
      },
      () => {
        if (!this.state.confirm) {
          this.handleSubmit();
        } else {
          this.updateCustomer;
        }
      }
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

  confirm = () => {
    this.setState({ confirm: !this.state.confirm });
  };

  updateCustomer = (name) => {
    axios
      .put("/api/update-customer", { name, id: this.state.id })
      .then((res) => {
        console.log(res);
        if (res.data === "Customer Updated.") {
          this.setState({ confirm: false, name: "", updatedName: "" });
        }
      });
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
            placeholder="Enter customer Name or ID"
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
            <button onClick={this.confirm}>Change</button>
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

          <input
            type="submit"
            value="Add Customer"
            className="black-button-white-text"
          ></input>
        </form>
        {this.state.confirm && (
          <Confirmation
            message="Change the customer's name?"
            placeholder="New customer name"
            initialValue={this.state.name}
            yes={this.updateCustomer}
            no={this.confirm}
            input={true}
          />
        )}
      </div>
    );
  }
}
