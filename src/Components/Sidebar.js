import React from "react";
import "./sidebar.css";

export default class App extends React.Component {
  state = {
    activeComponent: "",
  };
  render() {
    return (
      <div className="sidebar-cont">
        <p
          onClick={() => {
            this.props.toggleComponent("customer");
            this.setState({ activeComponent: "customer" });
          }}
          style={{
            color: this.state.activeComponent === "customer" && "#00cccc",
          }}
        >
          Customer
        </p>
        <p
          onClick={() => {
            this.props.toggleComponent("location");
            this.setState({ activeComponent: "location" });
          }}
          style={{
            color: this.state.activeComponent === "location" && "#00cccc",
          }}
        >
          Location
        </p>
        <p
          onClick={() => {
            this.props.toggleComponent("container");
            this.setState({ activeComponent: "container" });
          }}
          style={{
            color: this.state.activeComponent === "container" && "#00cccc",
          }}
        >
          Container
        </p>
        <p
          onClick={() => {
            this.props.toggleComponent("transactions");
            this.setState({ activeComponent: "transactions" });
          }}
          style={{
            color: this.state.activeComponent === "transactions" && "#00cccc",
          }}
        >
          Transactions
        </p>
        <p
          onClick={() => {
            this.props.toggleComponent("bill");
            this.setState({ activeComponent: "bill" });
          }}
          style={{
            color: this.state.activeComponent === "bill" && "#00cccc",
          }}
        >
          Bill
        </p>
      </div>
    );
  }
}
