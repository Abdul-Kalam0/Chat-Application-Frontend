import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import MessageList from "./MessageList";

const BASE_URL = "https://chat-application-backend-7lg7.onrender.com";
// const BASE_URL = "http://localhost:5001";

// Create socket once
const socket = io(BASE_URL, {
  transports: ["websocket"],
});

export const Chat = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  // Join room only AFTER socket connects
  useEffect(() => {
    const joinRoom = () => {
      socket.emit("join", user.username);
      console.log("Joined room:", user.username);
    };

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      joinRoom();
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [user.username]);

  // Fetch users
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

  // Receive messages from server with duplicate prevention
  useEffect(() => {
    const onReceive = (msg) => {
      console.log("Received message:", msg); // Debug log
      setMessages((prev) => {
        // Prevent duplicates by checking sender, receiver, and message content
        const isDuplicate = prev.some(
          (existing) =>
            existing.sender === msg.sender &&
            existing.receiver === msg.receiver &&
            existing.message === msg.message
        );
        return isDuplicate ? prev : [...prev, msg];
      });
    };

    socket.on("receive_message", onReceive);
    return () => socket.off("receive_message", onReceive);
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

  // Send message with local addition for instant UI update
  const sendMessage = () => {
    if (!currentMessage.trim() || !currentChat) return;

    const messageData = {
      sender: user.username,
      receiver: currentChat,
      message: currentMessage.trim(),
    };

    socket.emit("send_message", messageData);
    console.log("Sent message:", messageData); // Debug log

    // Add locally for immediate sender feedback (duplicate prevention in listener)
    setMessages((prev) => [...prev, messageData]);
    setCurrentMessage("");
  };

  return (
    <div className="container-fluid mt-4">
      <h3 className="text-center mb-4">Welcome, {user.username}</h3>

      <div className="row">
        {/* User List */}
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

        {/* Chat Area */}
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
