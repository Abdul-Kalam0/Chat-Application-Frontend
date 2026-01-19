import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import MessageList from "./MessageList";

const BASE_URL = "https://chat-application-backend-7lg7.onrender.com";
//const BASE_URL = "http://localhost:5001";

// create socket once
const socket = io(BASE_URL);

export const Chat = ({ user, setUser }) => {
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  // 🔑 Join user room ONCE
  useEffect(() => {
    socket.emit("join", user.username);
  }, [user.username]);

  // 📥 Fetch users
  useEffect(() => {
    axios
      .get(`${BASE_URL}/users`, {
        params: { currentUser: user.username },
      })
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
  }, [user.username]);

  // 📡 Receive private messages
  useEffect(() => {
    const handleReceive = (msg) => {
      if (msg.sender === currentChat || msg.receiver === currentChat) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receive_message", handleReceive);
    return () => socket.off("receive_message", handleReceive);
  }, [currentChat]);

  // 📜 Fetch chat history
  const fetchMessages = async (receiver) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/messages`, {
        params: { sender: user.username, receiver },
      });
      setMessages(data);
      setCurrentChat(receiver);
    } catch (err) {
      console.error(err);
    }
  };

  // ✉️ Send message (NO local push)
  const sendMessage = () => {
    if (!currentMessage.trim() || !currentChat) return;

    socket.emit("send_message", {
      sender: user.username,
      receiver: currentChat,
      message: currentMessage,
    });

    setCurrentMessage("");
  };

  // 🚪 Logout
  const logout = () => {
    socket.disconnect();
    setUser(null);
  };

  return (
    <div className="container-fluid mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between mb-3">
        <h4>
          Welcome, <span className="text-primary">{user.username}</span>
        </h4>
        <button className="btn btn-danger" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="row">
        {/* Users */}
        <div className="col-md-3">
          <div className="list-group">
            {users.map((u) => (
              <button
                key={u._id}
                className={`list-group-item list-group-item-action ${
                  currentChat === u.username ? "active" : ""
                }`}
                onClick={() => fetchMessages(u.username)}
              >
                {u.username}
              </button>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="col-md-9">
          {currentChat ? (
            <>
              <MessageList messages={messages} user={user} />

              <div className="input-group mt-3">
                <input
                  className="form-control"
                  placeholder="Type a message..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button className="btn btn-primary" onClick={sendMessage}>
                  Send
                </button>
              </div>
            </>
          ) : (
            <p className="text-muted">Select a user to start chat</p>
          )}
        </div>
      </div>
    </div>
  );
};
