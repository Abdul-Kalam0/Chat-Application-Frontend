import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import MessageList from "./MessageList";

// ===== BACKEND URL =====
const BASE_URL = "https://chat-application-backend-7lg7.onrender.com";
//const BASE_URL = "http://localhost:5001";

// create socket ONCE
const socket = io(BASE_URL);

export const Chat = ({ user, setUser }) => {
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  // ================= FETCH USERS + SOCKET LISTENER =================
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/users`, {
          params: { currentUser: user.username },
        });
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };

    fetchUsers();

    const handleReceive = (data) => {
      if (data.sender === currentChat || data.receiver === currentChat) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [currentChat, user.username]);

  // ================= FETCH CHAT HISTORY =================
  const fetchMessages = async (receiver) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/messages`, {
        params: { sender: user.username, receiver },
      });
      setMessages(data);
      setCurrentChat(receiver);
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };

  // ================= SEND MESSAGE =================
  const sendMessage = () => {
    if (!currentMessage.trim() || !currentChat) return;

    const messageData = {
      sender: user.username,
      receiver: currentChat,
      message: currentMessage,
    };

    socket.emit("send_message", messageData);
    setMessages((prev) => [...prev, messageData]);
    setCurrentMessage("");
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    socket.disconnect(); // optional but clean
    setUser(null); // redirect to login page
  };

  return (
    <div className="container-fluid mt-4">
      {/* ===== HEADER WITH LOGOUT ===== */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">
          Welcome, <span className="text-primary">{user.username}</span>
        </h4>

        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="row">
        {/* ===== USERS SIDEBAR ===== */}
        <div className="col-md-4 col-lg-3 mb-3">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-primary text-white fw-bold">
              Chats
            </div>

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

        {/* ===== CHAT WINDOW ===== */}
        <div className="col-md-8 col-lg-9">
          {currentChat ? (
            <div className="card shadow-sm h-100">
              <div className="card-header fw-bold">
                Chatting with {currentChat}
              </div>

              <div
                className="card-body overflow-auto"
                style={{ height: "60vh" }}
              >
                <MessageList messages={messages} user={user} />
              </div>

              <div className="card-footer">
                <div className="input-group">
                  <input
                    type="text"
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
              </div>
            </div>
          ) : (
            <div className="card h-100 shadow-sm d-flex align-items-center justify-content-center">
              <p className="text-muted m-0">Select a user to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
