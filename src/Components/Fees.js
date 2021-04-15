import React from "react";
import axios from "axios";
import "./fees.css";

export default class Fees extends React.Component {
  state = {
    fees: [],
    suggestions: [],
    feeNameInput: "",
    feeAmountInput: "",
    feeNames: [],
    feeId: null,
    emptyFields: [],
  };

  componentDidMount() {
    this.getFees();
  }

  /**
   * @description - This function retireves each type of fee with its id and the associated amount for that fee from the db. Relevant data from each row in the db is inserted into an object and set to state.
   */
  getFees = () => {
    axios.get("/api/get-fees").then((res) => {
      const data = res.data;
      const fees = [];

      for (let i = 0; i < data.length; i++) {
        fees.push({ id: data[i][0], name: data[i][1], amount: data[i][2] });
      }

      const feeNames = [];

      for (let i = 0; i < fees.length; i++) {
        feeNames.push(fees[i].name.value.toUpperCase());
      }

      this.setState({
        fees,
        feeNames,
      });
    });
  };

  handleFeeNameOnChange = (e) => {
    const suggestions = [];

    this.setState(
      {
        feeNameInput: e.target.value.toUpperCase(),
      },
      () => {
        if (this.state.feeNameInput === "") {
          this.setState({ suggestions: [] });
          return;
        }

        this.state.feeNames.forEach((element) => {
          if (element.startsWith(this.state.feeNameInput)) {
            suggestions.push(element);
            this.setState({ suggestions });
          }
        });
      }
    );
  };

  handleFeeAmountOnChange = (e) => {
    // test to allow only numbers or periods
    const regex = /^[0-9,.]*$/;
    if (e.target.value === "" || regex.test(e.target.value)) {
      this.setState({ feeAmountInput: e.target.value });
    }
  };

  useSuggestion = (suggestion) => {
    this.setState({ emptyFields: [] });
    this.setState(
      {
        feeNameInput: suggestion,
      },
      () => {
        let currentFee = this.state.fees.find(
          (elem) => elem.name.value === suggestion
        );

        this.setState({
          feeAmountInput: currentFee.amount.value,
          suggestions: [],
          feeId: currentFee.id.value,
        });
      }
    );
  };

  /**
   * @description - checks for empty fields that are required and concatenates them in a string so that error indications can be rendered for the user
   */
  checkForEmptyFields = () => {
    let emptyFields = this.state.emptyFields;
    if (this.state.feeNameInput === "") {
      emptyFields.push("feeNameInput");
    }

    if (this.state.feeAmountInput === "") {
      emptyFields.push("feeAmountInput");
    }

    this.setState(
      {
        emptyFields,
      },
      () => {
        if (!this.state.emptyFields.length) {
          this.props.handleSubmit({
            id: this.state.feeId,
            name: this.state.feeNameInput,
            amount: this.state.feeAmountInput,
          });

          this.setState({ id: null, feeNameInput: "", feeAmountInput: "" });
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

  render() {
    return (
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            this.checkForEmptyFields();
          }}
        >
          <input
            type="text"
            onChange={this.handleFeeNameOnChange}
            name="feeNameInput"
            onFocus={this.removeEmptyField}
            style={{
              border: this.isFieldEmpty("feeNameInput") && "solid 1px red",
            }}
            value={this.state.feeNameInput}
            placeholder={this.props.feeNameText}
          ></input>
          <input
            type="text"
            onFocus={this.removeEmptyField}
            style={{
              border: this.isFieldEmpty("feeAmountInput") && "solid 1px red",
            }}
            onChange={this.handleFeeAmountOnChange}
            name="feeAmountInput"
            value={this.state.feeAmountInput}
            placeholder={this.props.feeAmountText}
          ></input>
          <input
            type="submit"
            value={this.props.buttonText}
            className="black-button-white-text"
          ></input>
        </form>

        <div className="suggestion-cont">
          {this.state.suggestions.map((suggestion, index) => {
            return (
              <div
                key={index}
                onClick={() => this.useSuggestion(suggestion)}
                className="suggestion"
              >
                {suggestion}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
