import React from "react";

export default class LocationForm extends React.Component {
  state = {
    id: "",
    address1: "",
    address2: "",
    accountType: "perm",
    emptyFields: [],
  };

  componentDidMount() {
    this.setState({
      id: this.props.id,
      address1: this.props.address1,
      address2: this.props.address2,
      accountType:
        this.props.accountType && this.props.accountType.toLowerCase(),
    });

    console.log(this.props.accountType);
  }

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
      console.log("NAME: ", e.target.name, "VALUE: ", e.target.value);
      this.setState({ [e.target.name]: e.target.value });
    }
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (this.props.confirm) return;

          let data = {};
          data.id = this.state.id;
          data.address1 = this.state.address1;
          data.address2 = this.state.address2;
          data.accountType = this.state.accountType;

          this.props.submit(data);
        }}
      >
        {!this.props.confirm && (
          <input
            type="text"
            placeholder="Id"
            name="id"
            onChange={this.handleChange}
            value={this.state.id && this.state.id}
            style={{ border: this.isFieldEmpty("id") && "solid 1px red" }}
            onFocus={this.removeEmptyField}
          ></input>
        )}

        <input
          type="text"
          placeholder="Address 1"
          name="address1"
          onChange={this.handleChange}
          value={this.state.address1 && this.state.address1}
          style={{ border: this.isFieldEmpty("address1") && "solid 1px red" }}
          onFocus={this.removeEmptyField}
        ></input>
        <input
          type="text"
          placeholder="Address 2"
          name="address2"
          onChange={this.handleChange}
          value={this.state.address2 && this.state.address2}
          style={{ border: this.isFieldEmpty("address2") && "solid 1px red" }}
          onFocus={this.removeEmptyField}
        ></input>
        <select
          onChange={this.handleChange}
          value={this.state.accountType === "temp" ? "temp" : "perm"}
          name="accountType"
        >
          <option value="perm">Perm</option>
          <option value="temp">Temp</option>
        </select>
        {!this.props.confirm ? (
          <input
            type="submit"
            className="black-button-white-text"
            value="Add Location"
          ></input>
        ) : (
          <div>
            <button
              onClick={() => {
                let data = {};
                data.id = this.state.id;
                data.address1 = this.state.address1;
                data.address2 = this.state.address2;
                data.accountType = this.state.accountType;
                this.props.yes(data);
              }}
            >
              Yes
            </button>
            <button onClick={this.props.no}>No</button>
          </div>
        )}
      </form>
    );
  }
}
