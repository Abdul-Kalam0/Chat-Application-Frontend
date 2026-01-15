import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import MessageList from "./MessageList";

const BASE_URL = "https://chat-application-backend-001.vercel.app";

const socket = io(BASE_URL);

export const Chat = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  // Join socket room
  useEffect(() => {
    if (user?.username) {
      socket.emit("join", user.username);
    }
  }, [user.username]);

  // Fetch users once
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/users`, {
          params: { currentUser: user.username },
        });
        setUsers(data);
      } catch (error) {
        console.error("Users fetch error:", error);
      }
    };

    fetchUsers();
  }, [user.username]);

  // Listen to socket messages
  useEffect(() => {
    const handler = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receive_message", handler);
    return () => socket.off("receive_message", handler);
  }, []);

  // Load chat history
  const fetchMessages = async (receiver) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/messages`, {
        params: { sender: user.username, receiver },
      });
      setMessages(data);
      setCurrentChat(receiver);
    } catch (error) {
      console.error("Message fetch error:", error);
    }
  };

  // Send message
  const sendMessage = () => {
    if (!currentMessage.trim() || !currentChat) return;

    socket.emit("send_message", {
      sender: user.username,
      receiver: currentChat,
      message: currentMessage.trim(),
    });

    setCurrentMessage("");
  };

  return (
    <div className="container-fluid mt-4">
      <h3 className="text-center mb-4">Welcome, {user.username}</h3>

      <div className="row">
        {/* Users */}
        <div className="col-md-4 col-lg-3 border-end">
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
        <div className="col-md-8 col-lg-9">
          {currentChat ? (
            <div className="d-flex flex-column h-100">
              <div className="border-bottom p-2 fw-bold">
                Chatting with {currentChat}
              </div>

              <div className="flex-grow-1 overflow-auto p-3">
                <MessageList messages={messages} user={user} />
              </div>

              <div className="p-3 border-top">
                <div className="input-group">
                  <input
                    className="form-control"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message"
                  />
                  <button className="btn btn-primary" onClick={sendMessage}>
                    Send
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
              Select a user to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
