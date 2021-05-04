import axios from "axios";
import React from "react";
import "./location.css";
import Confirmation from "./Confirmation";
import LocationForm from "./LocationForm";

export default class Location extends React.Component {
  state = {
    locationId: "",
    confirmation: false,
    address1: "",
    address2: "",
    id: "",
    emptyFields: [],
    newId: "",
    newAddress1: "",
    newAddress2: "",
    newAccountType: "perm",
    confirm: false,
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
        this.setState({
          id: res.data.id,
          address1: res.data.address1,
          address2: res.data.address2,
        });
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

  handleChange = (e) => {
    // test to allow only numbers
    const regex = /^[0-9\b]+$/;

    if (e.target.name === "locationId" || e.target.name === "newId") {
      if (e.target.value === "" || regex.test(e.target.value)) {
        this.setState({
          [e.target.name]: e.target.value,
        });
      }
    } else {
      this.setState({ [e.target.name]: e.target.value });
    }
  };

  addLocation = (e) => {
    e.preventDefault();
    axios
      .post("/api/add-location", {
        id: this.state.newId,
        address1: this.state.newAddress1,
        address2: this.state.newAddress2,
        type: this.state.newAccountType,
      })
      .then((res) => {
        // NOTIFICATION
        console.log(res);
        this.setState({
          newId: "",
          newAccountType: "",
          newAddress1: "",
          newAddress2: "",
        });
      });
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

  confirm = () => {
    this.setState({ confirm: !this.state.confirm });
  };

  updateLocation = (location) => {
    console.log(location);
    // axios.put("/api/update-location", { location }).then((res) => {
    //   console.log(res);
    //   if (res.data === "Location Updated.") {
    //     this.setState({ confirm: false });
    //   }
    // });
  };

  render() {
    return (
      <div className="location-cont">
        <h1>Find a Location</h1>
        <form onSubmit={this.checkForEmptyFields}>
          <input
            type="text"
            onChange={this.handleChange}
            value={this.state.locationId}
            name="locationId"
            placeholder="Enter location ID"
            onFocus={this.removeEmptyField}
            style={{
              border: this.isFieldEmpty("locationId") && "solid 1px red",
            }}
          ></input>
          <input
            type="submit"
            className="black-button-white-text"
            value="Search"
          ></input>
        </form>

        {this.state.id && (
          <div>
            <p>Address1: {this.state.address1}</p>
            <p>Address2: {this.state.address2}</p>
            <p>ID: {this.state.id}</p>
            <button onClick={this.confirm}>Change</button>
          </div>
        )}
        <p>Add a Location</p>
        <LocationForm submit={this.addLocation} />
        {this.state.confirm && (
          <Confirmation
            message="Change the location?"
            component={LocationForm}
            yes={this.updateLocation}
            no={this.confirm}
            id={this.state.id}
            address1={this.state.address1}
            address2={this.state.address2}
            // accountType={this.state.accountType}
          />
        )}
      </div>
    );
  }
}
