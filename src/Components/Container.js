import React from "react";
import axios from "axios";
import "./container.css";
// import { createNotification } from "../utils/notifications";

export default class Container extends React.Component {
  constructor() {
    super();
    this.state = {
      containerId: "",
      cubicYard: "30",
      type: "COMPACTOR",
      cityOwned: 1,
      inStock: 1,
      returnedToStockDate: "",
      customer: "",
      location: "",
      comment: "",
      setDate: "",
      containerIdSearch: "",
      container: [], // the returned container the user searched for
      emptyFields: [],
      height: "", // height of form div
      containerExists: false,
    };

    this.timeout = null;
  }

  componentDidMount() {
    const height = this.formContainer.clientHeight;
    this.setState({ height });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.containerId != this.state.containerId) {
      this.fillContainerForm();
    }
  }

  createNotification = (type) => {
    return () => {
      switch (type) {
        case "info":
          NotificationManager.info("Info message");
          break;
        case "success":
          NotificationManager.success("Success message", "Title here");
          break;
        case "warning":
          NotificationManager.warning(
            "Warning message",
            "Close after 3000ms",
            3000
          );
          break;
        case "error":
          NotificationManager.error("Error message", "Click me!", 5000, () => {
            alert("callback");
          });
          break;
      }
    };
  };

  fillContainerForm = () => {
    clearTimeout(this.timeout);

    if (!this.state.containerId) {
      this.setState({
        cubicYard: "30",
        type: "COMPACTOR",
        cityOwned: 1,
        setDate: "",
        location: "",
        customer: "",
        comment: "",
        containerExists: false,
      });
      return;
    }

    this.timeout = setTimeout(() => {
      axios.get(`/api/get-container/${this.state.containerId}`).then((res) => {
        console.log(res);
        if (res.data === "Container Not Found.") {
          this.setState({
            cubicYard: "30",
            type: "COMPACTOR",
            cityOwned: 1,
            setDate: "",
            location: "",
            customer: "",
            comment: "",
            containerExists: false,
          });
        } else {
          this.setState({
            cubicYard: res.data[2].value,
            type: res.data[3].value,
            cityOwned: res.data[4].value,
            setDate: res.data[5].value,
            location: res.data[8].value,
            customer: res.data[9].value,
            comment: res.data[10].value,
            containerExists: true,
          });
        }
      });
    }, 500);
  };

  handleChange = (e) => {
    // test to allow only numbers
    const regex = /^[0-9\b]+$/;
    if (
      e.target.name === "containerId" ||
      e.target.name === "containerIdSearch" ||
      e.target.name === "location"
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

  handleSubmit = () => {
    if (this.state.emptyFields.length) {
      return;
    }
    const {
      containerId,
      cubicYard,
      type,
      cityOwned,
      inStock,
      returnedToStockDate,
      location,
      comment,
    } = this.state;

    let data = {
      containerId,
      cubicYard,
      type,
      cityOwned,
      inStock,
      returnedToStockDate,
      location,
      comment,
    };

    if (this.state.containerId === "") {
      axios
        .post("/api/insert-container", data)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      axios
        .put("/api/update-container", data)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  searchContainer = (e) => {
    e.preventDefault();
    const emptyFields = this.state.emptyFields;
    if (this.state.containerIdSearch === "") {
      emptyFields.push("containerIdSearch");
      this.setState({ emptyFields });
      return;
    }
    axios
      .get(`/api/get-container/${this.state.containerIdSearch}`)
      .then((res) => {
        if (res.data === "Container Not Found.") {
          console.log("HIT");
          this.createNotification("error");
          // createNotification(
          //   NotificationManager,
          //   "error",
          //   "Container does not exist."
          // );
        } else {
          this.setState({
            container: res.data,
          });
        }
      });
  };

  /**
   * @description - checks for empty fields that are required and concatenates them in a string so that error indications can be rendered for the user
   */
  checkForEmptyFields = (e) => {
    e.preventDefault();
    let emptyFields = this.state.emptyFields;

    if (this.state.location === "") {
      emptyFields.push("location");
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
      <div className="container-parent">
        <div
          className="container-cont"
          ref={(formContainer) => {
            this.formContainer = formContainer;
          }}
          style={{ height: this.state.height }}
        >
          <h1>Add or Update a Container</h1>

          <div className="inner-container-cont">
            <form
              onSubmit={this.checkForEmptyFields}
              className="container-form"
            >
              <label htmlFor="container-id">Container ID:</label>
              <input
                placeholder="Enter Container ID"
                onChange={this.handleChange}
                name="containerId"
                value={this.state.containerId}
              ></input>
              <label htmlFor="cubic-yard">Cubic Yard: </label>
              <select
                name="cubicYard"
                onChange={this.handleChange}
                value={this.state.cubicYard}
              >
                <option value="30">30yd</option>
                <option value="40">35yd</option>
                <option value="40">40yd</option>
                <option value="40">42yd</option>
              </select>
              <label htmlFor="type">Type: </label>
              <select
                name="type"
                onChange={this.handleChange}
                value={this.state.type}
              >
                <option value="COMPACTOR">COMPACTOR</option>
                <option value="OPEN TOP">OPEN TOP</option>
              </select>
              <label htmlFor="city-owned">City Owned: </label>
              <select
                name="cityOwned"
                onChange={this.handleChange}
                value={this.state.cityOwned}
              >
                <option value="1">YES</option>
                <option value="0">NO</option>
              </select>
              <label htmlFor="setDate">Set Date </label>
              <input
                type="date"
                name="setDate"
                onChange={this.handleChange}
                value={this.state.setDate ? this.state.setDate : ""}
              ></input>
              <label htmlFor="customer">Customer </label>
              <input
                type="text"
                name="customer"
                onChange={this.handleChange}
                value={this.state.customer ? this.state.customer : ""}
              ></input>
              <label htmlFor="location">Location: </label>
              <input
                type="text"
                name="location"
                onFocus={this.removeEmptyField}
                onChange={this.handleChange}
                value={this.state.location ? this.state.location : ""}
                style={{
                  border: this.isFieldEmpty("location") && "solid 1px red",
                }}
              ></input>
              <label htmlFor="comment">Comment: </label>
              <input
                type="text"
                name="comment"
                onChange={this.handleChange}
                value={this.state.comment ? this.state.comment : ""}
              ></input>
              <input
                type="submit"
                className="black-button-white-text"
                value={
                  this.state.containerExists
                    ? "Update Container"
                    : "Add Container"
                }
              ></input>
            </form>
          </div>
        </div>

        <div
          id="vertical-line"
          style={{ height: this.state.height - 20 }}
        ></div>

        <div className="container-cont" style={{ height: this.state.height }}>
          <h1>Find a Container</h1>
          <form
            onSubmit={this.searchContainer}
            className="container-form-second"
          >
            <input
              placeholder="Search for a Container"
              name="containerIdSearch"
              onFocus={this.removeEmptyField}
              style={{
                border:
                  this.isFieldEmpty("containerIdSearch") && "solid 1px red",
              }}
              onChange={this.handleChange}
              value={this.state.containerIdSearch}
            ></input>
            <input
              type="submit"
              className="black-button-white-text"
              value="Search"
            ></input>
          </form>
          <div className="container-form-search-results">
            {this.state.container.map((elem, i) => {
              return (
                <p key={i}>
                  <b>{elem.metadata.colName}:</b>
                  {elem.value === false
                    ? "NO"
                    : elem.value === true
                    ? "YES"
                    : elem.value}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}
