import React from "react";
import axios from "axios";
import "./container.css";

export default class Container extends React.Component {
  state = {
    containerId: "",
    cubicYard: "30",
    type: "COMPACTOR",
    cityOwned: 1,
    inStock: 1,
    returnedToStockDate: "",
    location: "",
    comment: "",
    containerIdSearch: "",
    container: [], // the returned container the user searched for
    emptyFields: [],
    height: "", // height of form div
  };

  componentDidMount() {
    const height = this.formContainer.clientHeight;
    this.setState({ height });
  }

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
        console.log(res);
        this.setState({
          container: res.data,
        });
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
                placeholder="Only required for updating"
                onChange={this.handleChange}
                name="containerId"
                value={this.state.containerId}
              ></input>
              <label htmlFor="cubic-yard">Cubic Yard: </label>
              <select name="cubicYard" onChange={this.handleChange}>
                <option value="30">30yd</option>
                <option value="40">40yd</option>
              </select>
              <label htmlFor="type">Type: </label>
              <select name="type" onChange={this.handleChange}>
                <option value="COMPACTOR">COMPACTOR</option>
                <option value="OPEN TOP">OPEN TOP</option>
              </select>
              <label htmlFor="city-owned">City Owned: </label>
              <select name="cityOwned" onChange={this.handleChange}>
                <option value="1">YES</option>
                <option value="0">NO</option>
              </select>
              <label htmlFor="in-stock">In Stock: </label>
              <input
                readOnly
                value={this.state.location === "" ? "YES" : "NO"}
              ></input>
              <label htmlFor="returned-to-stock-date">
                Returned to Stock Date:{" "}
              </label>
              <input
                type="date"
                name="returnedToStockDate"
                onChange={this.handleChange}
              ></input>
              <label htmlFor="location">Location: </label>
              <input
                type="text"
                name="location"
                onFocus={this.removeEmptyField}
                onChange={this.handleChange}
                value={this.state.location}
                style={{
                  border: this.isFieldEmpty("location") && "solid 1px red",
                }}
              ></input>
              <label htmlFor="comment">Comment: </label>
              <input
                type="text"
                name="comment"
                onChange={this.handleChange}
              ></input>
              <input
                type="submit"
                className="black-button-white-text"
                value={
                  this.state.containerId ? "Update Container" : "Add Container"
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
            <input type="submit" className="black-button-white-text"></input>
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
