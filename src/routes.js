import React from "react";
import { Switch, Route } from "react-router-dom";
import Login from "./Components/Login";
import Home from "./Components/Home";

export default (
  <Switch>
    <Route exact path="/" component={Login} />
    <Route path="/home" component={Home} />
  </Switch>
);
