import React from "react";
import "./confirmation.css";

export default function Confirmation(props) {
  return (
    <div className="confirmation-form">
      <p>{props.message}</p>
      <p>{props.name}</p>
      <p>{props.id}</p>
      <button onClick={props.yes}>Yes</button>
      <button onClick={props.no}>No</button>
    </div>
  );
}
