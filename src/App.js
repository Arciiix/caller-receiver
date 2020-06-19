import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import "./css/bootstrap.min.css";
import Home from "./components/Home.js";
import Messages from "./components/Messages.js";

class App extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route path="/" exact>
            <Home />
          </Route>
          <Route path="/messages">
            <Messages />
          </Route>
        </Switch>
      </Router>
    );
  }
}

export default App;
