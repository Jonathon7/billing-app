import axios from "axios";
import React from "react";
import Confirmation from "./Confirmation";
import "./location.css";

export default class Location extends React.Component {
  state = {
    locationId: "",
    accountType: "perm",
    confirmation: false,
    address1: "",
    address2: "",
    id: "",
    emptyFields: [],
  };

  handleSubmit = () => {
    if (this.state.emptyFields.length) {
      console.log(this.state.emptyFields);
      return;
    }
    const { locationId } = this.state;

    axios.get(`/api/get-location/${locationId}`).then((res) => {
      console.log(res);
      if (res.data === "Location not found.") {
        this.getLocationInfo();
      } else {
        this.setState({ id: res.data.id, address1: res.data.address });
      }
    });
  };

  /**
   * @description - function gets called when the location does not exist in the TRASH db and needs to be pulled from AS400 db
   */
  getLocationInfo = () => {
    axios
      .post(`/api/insert-location`, {
        id: this.state.locationId,
        confirm: true,
      })
      .then((res) => {
        console.log(res);
        if (res.data === "Location does not exist.") {
          // TODO: display notification
          return;
        }
        const address = this.removeWhiteSpace(res.data[0].trim());
        console.log(address);
        this.setState({ confirmation: true, address1: address });
      });
  };

  setAccountType = (e) => {
    this.setState({
      accountType: e.target.value,
    });
  };

  setLocationId = (e) => {
    // test to allow only numbers
    const regex = /^[0-9\b]+$/;

    if (e.target.value === "" || regex.test(e.target.value)) {
      this.setState({
        locationId: e.target.value,
      });
    }
  };

  handleConfirmationForm = (yes) => {
    if (yes) {
      axios
        .post(`/api/insert-location`, {
          id: this.state.locationId,
          accountType: this.state.accountType,
          address1: this.state.address1,
          address2: this.state.address2,
          confirm: false,
        })
        .then((res) => {
          this.setState({
            confirmation: false,
            locationId: "",
            address1: "",
            address2: "",
            accountType: "perm",
          });
        });
    } else {
      this.setState({
        confirmation: false,
        locationId: "",
        address1: "",
        address2: "",
        accountType: "perm",
      });
    }
  };

  removeWhiteSpace = (string) => {
    let result = "";
    let prevChar = "";

    for (let i = 0; i < string.length; i++) {
      if (prevChar === " " && string[i] === " ") {
        prevChar = string[i];
        continue;
      } else {
        result += string[i];
      }

      prevChar = string[i];
    }

    return result;
  };

  /**
   * @description - checks for empty fields that are required and concatenates them in a string so that error indications can be rendered for the user
   */
  checkForEmptyFields = (e) => {
    e.preventDefault();
    let emptyFields = this.state.emptyFields;
    if (this.state.locationId === "") {
      emptyFields.push("locationId");
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
      <div className="location-cont">
        <h1>Find a Location</h1>
        <form onSubmit={this.checkForEmptyFields}>
          <input
            type="text"
            onChange={this.setLocationId}
            value={this.state.locationId}
            name="locationId"
            placeholder="Enter location ID"
            onFocus={this.removeEmptyField}
            style={{
              border: this.isFieldEmpty("locationId") && "solid 1px red",
            }}
          ></input>
          <select name="account-type" onChange={this.setAccountType}>
            <option value="perm">Perm</option>
            <option value="temp">Temp</option>
          </select>
          <input type="submit" className="black-button-white-text"></input>
        </form>

        {this.state.id && (
          <div>
            <p>Address: {this.state.address1}</p>
            <p>ID: {this.state.id}</p>
          </div>
        )}

        {this.state.confirmation && (
          <Confirmation
            message={
              "Location was not found, would you like to create the location?"
            }
            name={this.state.address1}
            id={this.state.locationId}
            yes={() => this.handleConfirmationForm(true)}
            no={() => this.handleConfirmationForm(false)}
          />
        )}
      </div>
    );
  }
}
