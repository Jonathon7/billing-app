import React from "react";
import "./suggestions.css";

export default class Suggestions extends React.Component {
  state = {
    suggestions: [],
  };
  render() {
    const displaySuggestions = this.state.suggestions.map(
      (suggestion, index) => {
        return (
          <div key={index} onClick={() => this.props.useSuggestion(suggestion)}>
            {suggestion.text}
          </div>
        );
      }
    );
    return <div>{displaySuggestions}</div>;
  }
}
