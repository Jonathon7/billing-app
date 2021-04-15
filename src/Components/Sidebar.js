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
            color: this.state.activeComponent === "customer" && "white",
            opacity: this.state.activeComponent === "customer" && "1",
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
            color: this.state.activeComponent === "location" && "white",
            opacity: this.state.activeComponent === "location" && "1",
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
            color: this.state.activeComponent === "container" && "white",
            opacity: this.state.activeComponent === "container" && "1",
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
            color: this.state.activeComponent === "transactions" && "white",
            opacity: this.state.activeComponent === "transactions" && "1",
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
            color: this.state.activeComponent === "bill" && "white",
            opacity: this.state.activeComponent === "bill" && "1",
          }}
        >
          Bill
        </p>
      </div>
    );
  }
}
