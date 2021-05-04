import React from "react";
import "./confirmation.css";

export default class Confirmation extends React.Component {
  state = {
    val: "",
  };

  componentDidMount() {
    if (this.props.initialValue) {
      this.setState({ val: this.props.initialValue });
    }
  }

  handleChange = (e) => {
    this.setState({ val: e.target.value });
  };

  render() {
    const LocationForm = this.props.component;
    return (
      <div className="confirmation-form">
        <p>{this.props.message}</p>
        {this.props.input && (
          <input
            onChange={this.handleChange}
            placeholder={this.props.placeholder}
            value={this.state.val}
          ></input>
        )}
        {this.props.component && (
          <LocationForm
            confirm={true}
            yes={this.props.yes}
            no={this.props.no}
            id={this.props.id}
            address1={this.props.address1}
            address2={this.props.address2}
            // accountType={this.props.accountType}
          />
        )}
        {!this.props.component && (
          <>
            <button onClick={() => this.props.yes(this.state.val)}>Yes</button>
            <button onClick={this.props.no}>No</button>
          </>
        )}
      </div>
    );
  }
}
