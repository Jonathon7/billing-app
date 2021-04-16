import React from "react";
import ReactDOM from "react-dom";
import Home from "./Components/Home";
import "./index.css";

const App = () => {
  return (
    <div>
      <Home />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
