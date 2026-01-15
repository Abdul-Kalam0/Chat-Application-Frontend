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
    // Join the user's room for targeted message delivery
    socket.emit("join", user.username);

    // Fetch all users excluding the current user
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(
          "https://chat-application-backend-001.vercel.app/users",
          {
            params: { currentUser: user.username },
          }
        );
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };

    fetchUsers();

    // Listen for incoming messages
    socket.on("receive_message", (data) => {
      // Only update if it's for the current chat and not a duplicate
      if (
        (data.sender === currentChat || data.receiver === currentChat) &&
        !messages.some((msg) => msg._id === data._id) // Prevent duplicates
      ) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [currentChat, user.username, messages]); // Added messages to deps for duplicate check

  const fetchMessages = async (receiver) => {
    try {
      const { data } = await axios.get(
        "https://chat-application-backend-001.vercel.app/messages",
        {
          params: { sender: user.username, receiver },
        }
      );
      setMessages(data);
      setCurrentChat(receiver);
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };

  const sendMessage = () => {
    if (!currentMessage.trim()) return; // Prevent empty messages
    const messageData = {
      sender: user.username,
      receiver: currentChat,
      message: currentMessage,
    };
    socket.emit("send_message", messageData);
    // Don't add locally here—let the socket listener handle it to avoid duplicates
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
              style={{ minWidth: "400px" }}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()} // Allow Enter to send
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
