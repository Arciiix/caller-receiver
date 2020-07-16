import React from "react";
import "../css/bootstrap.min.css";
import "../css/messages.css";
import io from "socket.io-client";
import { Alert, Form, Button } from "react-bootstrap";
import { MdHistory, MdArrowBack } from "react-icons/md";

class Messages extends React.Component {
  messagesDiv = React.createRef();
  constructor(props) {
    super(props);
    this.state = {
      isActive: true,
      message: "Jeszcze żadnej nie ma!",
      inputText: "",
      isViewingMessagesHistory: false,
      messages: [
        {
          content: "Tutaj będzie się wyświetlać historia wiadomości!",
          fromMe: true,
        },
      ],
    };
  }
  componentDidMount() {
    this.socket = io("");
    this.socket.on("messageReply", (content) => {
      this.setState({ message: content });
      this.saveMessage(content, false);
    });

    //When sender ends the call (leaves)
    this.socket.on("end", () => {
      this.setState({ isActive: false });
    });

    this.socket.emit("writingMessage");

    //When user leaves the page, send the notification about ended call
    window.addEventListener("beforeunload", () => {
      this.socket.emit("end");
    });

    this.scrollToBottom();
  }
  send() {
    this.socket.emit("sendMessage", this.state.inputText);
    this.saveMessage(this.state.inputText, true);
    this.setState({ inputText: "" }, this.forceUpdate);
  }

  saveMessage(content, isFromMe) {
    this.setState(
      {
        messages: [
          ...this.state.messages,
          { content: content, fromMe: isFromMe },
        ],
      },
      () => {
        this.scrollToBottom();
        this.forceUpdate();
      }
    );
  }

  renderPreviousMessage(message, index) {
    return (
      <div
        key={index}
        className={
          message.fromMe ? "bubble bubble-right" : "bubble bubble-left"
        }
      >
        <span
          key={index}
          className={"messageText"}
          style={{ color: message.fromMe ? "black" : "white" }}
        >
          {message.content}
        </span>
      </div>
    );
  }

  scrollToBottom() {
    if (this.state.isViewingMessagesHistory) {
      let shouldScroll =
        this.messagesDiv.scrollTop + this.messagesDiv.clientHeight !==
        this.messagesDiv.scrollHeight;

      if (shouldScroll) {
        this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
      }
    }
  }
  toogleHistory() {
    this.setState({
      isViewingMessagesHistory: !this.state.isViewingMessagesHistory,
    });
  }

  render() {
    if (this.state.isViewingMessagesHistory) {
      return (
        <div className="container">
          <div className="messages" ref={(e) => (this.messagesDiv = e)}>
            <div
              className="icon iconLeft"
              onClick={this.toogleHistory.bind(this)}
            >
              <MdArrowBack />
            </div>
            {this.state.messages.map(this.renderPreviousMessage)}
          </div>
          <div className="messageForm">
            <Form.Control
              className="messageInput"
              value={this.state.inputText}
              onKeyDown={(e) => {
                if (e.key.toLowerCase() === "enter") {
                  this.send.bind(this)();
                }
              }}
              onChange={(e) => {
                this.setState({ inputText: e.target.value });
              }}
            />
            <Button
              variant="success"
              className="sendBtn"
              onClick={this.send.bind(this)}
            >
              Wyślij
            </Button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="container">
          <div
            className="icon iconRight"
            onClick={this.toogleHistory.bind(this)}
          >
            <MdHistory />
          </div>
          <div className="activeStatusMessage">
            <div
              className={
                "activeDot " + (this.state.isActive ? "active" : "inactive")
              }
            ></div>
            <span
              className={
                "activeText " +
                (this.state.isActive ? "textActive" : "textInactive")
              }
            >
              <b>{this.state.isActive ? "Aktywny" : "Zakończono"}</b>
            </span>
          </div>
          <Alert className="messageAlert" variant="success">
            <Alert.Heading className="alertHeader">
              <b>Wiadomość</b>
            </Alert.Heading>
            <span className="messageBody">{this.state.message}</span>
          </Alert>

          <div className="messageForm">
            <Form.Control
              className="messageInput"
              value={this.state.inputText}
              onKeyDown={(e) => {
                if (e.key.toLowerCase() === "enter") {
                  this.send.bind(this)();
                }
              }}
              onChange={(e) => {
                this.setState({ inputText: e.target.value });
              }}
            />
            <Button
              variant="success"
              className="sendBtn"
              onClick={this.send.bind(this)}
            >
              Wyślij
            </Button>
          </div>
        </div>
      );
    }
  }
}

export default Messages;
