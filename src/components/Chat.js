import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import MessageList from "./MessageList";
import "./chat.css";

const BASE_URL = "https://chat-application-backend-7lg7.onrender.com";

// create socket ONCE
const socket = io(BASE_URL, {
  transports: ["websocket"],
});

export const Chat = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  // 🔹 Join socket room AFTER connection
  useEffect(() => {
    const onConnect = () => {
      socket.emit("join", user.username);
    };

    socket.on("connect", onConnect);
    return () => socket.off("connect", onConnect);
  }, [user.username]);

  // 🔹 Fetch users (depends on user.username)
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

    if (user?.username) fetchUsers();
  }, [user.username]);

  // 🔹 Listen for socket messages (attach ONCE)
  useEffect(() => {
    const handleReceive = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on("receive_message", handleReceive);
    return () => socket.off("receive_message", handleReceive);
  }, []);

  // 🔹 Fetch chat history
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

  // 🔹 Send message (server is source of truth)
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
    <div className="chat-container">
      <h2>Welcome, {user.username}</h2>

      <div className="chat-list">
        <h3>Chats</h3>
        {users.map((u) => (
          <div
            key={u._id}
            className={`chat-user ${
              currentChat === u.username ? "active" : ""
            }`}
            onClick={() => fetchMessages(u.username)}
          >
            {u.username}
          </div>
        ))}
      </div>

      {currentChat && (
        <div className="chat-window">
          <h5>You are chatting with {currentChat}</h5>

          <MessageList messages={messages} user={user} />

          <div className="message-field">
            <input
              type="text"
              placeholder="Type a message..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
            />
            <button className="btn-prime" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
