import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import MessageList from "./MessageList";
import "./chat.css";

const BASE_URL = "https://chat-application-backend-001.vercel.app";

// Create socket only once
const socket = io(BASE_URL, {
  transports: ["websocket"],
  autoConnect: true,
});

export const Chat = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  const currentChatRef = useRef(null);

  // Keep ref updated so socket callback always has latest value
  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

  // ================= Fetch Users (ONCE) =================
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/users`, {
          params: { currentUser: user.username },
        });
        setUsers(data.users); // use API shape correctly
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };

    fetchUsers();
  }, [user.username]);

  // ================= Socket Listener (ONCE) =================
  useEffect(() => {
    const handleMessage = (data) => {
      // Only add messages from active chat
      if (
        data.sender === currentChatRef.current ||
        data.receiver === currentChatRef.current
      ) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.on("receive_message", handleMessage);

    return () => {
      socket.off("receive_message", handleMessage);
    };
  }, []);

  // ================= Fetch Messages =================
  const fetchMessages = async (receiver) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/messages`, {
        params: { sender: user.username, receiver },
      });

      setMessages(data.messages);
      setCurrentChat(receiver);
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };

  // ================= Send Message =================
  const sendMessage = () => {
    if (!currentMessage.trim() || !currentChat) return;

    const messageData = {
      sender: user.username,
      receiver: currentChat,
      message: currentMessage.trim(),
    };

    socket.emit("send_message", messageData);

    // Optimistic UI update
    setMessages((prev) => [...prev, messageData]);
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
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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
