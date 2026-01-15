import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import MessageList from "./MessageList";

const socket = io("https://chat-application-backend-001.vercel.app");

export const Chat = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token"); // Get token from storage
        const { data } = await axios.get(
          "https://chat-application-backend-001.vercel.app/users",
          {
            params: { currentUser: user.username },
            headers: { Authorization: `Bearer ${token}` }, // Include token
          }
        );
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };

    fetchUsers();

    socket.on("receive_message", (data) => {
      if (data.sender === currentChat || data.receiver === currentChat) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [currentChat, user.username]);

  const fetchMessages = async (receiver) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "https://chat-application-backend-001.vercel.app/messages",
        {
          params: { sender: user.username, receiver },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(data);
      setCurrentChat(receiver);
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };

  const sendMessage = () => {
    const messageData = {
      sender: user.username,
      receiver: currentChat,
      message: currentMessage,
    };
    socket.emit("send_message", messageData);
    setMessages((prev) => [...prev, messageData]);
    setCurrentMessage("");
  };

  return (
    <div className="container-fluid mt-4">
      <h2 className="text-center mb-4">Welcome, {user.username}</h2>
      <div className="row">
        {/* Sidebar for users */}
        <div className="col-md-4 col-lg-3">
          <div className="card h-100">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Chats</h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
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
          </div>
        </div>
        {/* Chat window */}
        <div className="col-md-8 col-lg-9">
          {currentChat ? (
            <div className="card h-100">
              <div className="card-header bg-light">
                <h5 className="mb-0">Chatting with {currentChat}</h5>
              </div>
              <div
                className="card-body d-flex flex-column"
                style={{ height: "70vh" }}
              >
                <div className="flex-grow-1 overflow-auto mb-3">
                  <MessageList messages={messages} user={user} />
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type a message..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                  />
                  <button className="btn btn-primary" onClick={sendMessage}>
                    Send
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="d-flex justify-content-center align-items-center h-100">
              <p className="text-muted">Select a user to start chatting.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
