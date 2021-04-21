import axios from "axios";
import React from "react";
import "./login.css";

export default class Login extends React.Component {
  state = {
    username: "",
    password: "",
  };

  handleSubmit = (e) => {
    e.preventDefault();
    console.log(this.state);
    axios
      .post("/api/login", {
        username: this.state.username,
        password: this.state.password,
      })
      .then((res) => {
        // if there is a username on session
        if (res.data) {
          this.props.history.push("/home");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  onChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  render() {
    return (
      <div className="loginCont">
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={this.onChange}
          ></input>
          <input
            type="text"
            name="password"
            placeholder="Password"
            onChange={this.onChange}
          ></input>
          <input type="submit"></input>
        </form>
      </div>
    );
  }
}
