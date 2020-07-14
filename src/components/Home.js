import React from "react";
import "../css/bootstrap.min.css";
import "../css/home.css";
import io from "socket.io-client";
import { Alert, Button } from "react-bootstrap";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "",
      name: "",
    };
  }
  componentDidMount() {
    this.socket = io("");
    this.socket.emit("getMessage");
    this.socket.on("message", (data) => {
      this.setState(
        {
          message: data.message,
          name: data.name,
        },
        this.forceUpdate
      );
    });
  }
  goToMessages() {
    window.location.href = "/messages";
  }
  end() {
    this.socket.emit("end");
  }

  mute() {
    this.socket.emit("mute");
  }
  render() {
    return (
      <div className="container">
        <Alert
          className="messageAlert"
          variant="success"
          dismissible
          onClose={this.mute.bind(this)}
        >
          <Alert.Heading className="alertTitle">
            <b>{this.state.name}</b>
          </Alert.Heading>
          <span className="message">{this.state.message}</span>
        </Alert>

        <Button
          variant="primary"
          className="buttons"
          block
          onClick={this.goToMessages}
        >
          Wyślij
        </Button>
        <Button
          variant="danger"
          className="buttons"
          block
          onClick={this.end.bind(this)}
        >
          Zakończ
        </Button>
      </div>
    );
  }
}

export default Home;
