import React from "react";
import Sidebar from "./Sidebar";
import Customer from "./Customer.js";
import Location from "./Location.js";
import Container from "./Container";
import Transactions from "./Transactions";
import Bill from "./Bill";
import "./home.css";

export default class Home extends React.Component {
  state = {
    component: "",
  };

  toggleComponent = (component) => {
    this.setState({ component });
  };

  render() {
    let component = null;
    switch (this.state.component) {
      case "customer":
        component = <Customer />;
        break;
      case "location":
        component = <Location />;
        break;
      case "container":
        component = <Container />;
        break;
      case "transactions":
        component = <Transactions />;
        break;
      case "bill":
        component = <Bill />;
        break;
      default:
        component = null;
    }

    return (
      <div className="home-cont">
        <Sidebar toggleComponent={this.toggleComponent} />
        {component}
      </div>
    );
  }
}
