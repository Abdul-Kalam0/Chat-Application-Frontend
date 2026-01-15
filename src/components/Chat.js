import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import MessageList from "./MessageList";

const socket = io("https://chat-application-backend-001.vercel.app", {
  transports: ["websocket"],  // Force WebSocket transport
});

export const Chat = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    // Log socket connection
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      // Join the user's room for targeted message delivery
      socket.emit("join", user.username);
      console.log(`Joined room for ${user.username}`);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

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

    // Listen for incoming messages with logging
    socket.on("receive_message", (data) => {
      console.log("Received message:", data);  // Debug log
      // Only update if it's for the current chat and not a duplicate (check by content)
      if (
        (data.sender === currentChat || data.receiver === currentChat) &&
        !messages.some(
          (msg) =>
            msg.sender === data.sender &&
            msg.receiver === data.receiver &&
            msg.message === data.message
        )
      ) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => {
      socket.off("receive_message");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [currentChat, user.username]);  // Removed 'messages' from deps

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
    if (!currentMessage.trim()) return;  // Prevent empty messages
    const messageData = {
      sender: user.username,
      receiver: currentChat,
      message: currentMessage,
    };
    socket.emit("send_message", messageData);
    console.log("Sent message:", messageData);  // Debug log
    // Add locally for immediate UI update
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
            <div className="card h-100 d-flex flex-column">
              <div className="card-header bg-light">
                <h5 className="mb-0">Chatting with {currentChat}</h5>
              </div>
              <div className="card-body d-flex flex-column flex-grow-1 p-0">
                {/* Message list with scrolling */}
                <div className="flex-grow-1 overflow-auto p-3" style={{ maxHeight: "60vh" }}>
                  <MessageList messages={messages} user={user} />
                </div>
                {/* Fixed input at bottom */}
                <div className="p-3 border-top">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type a message..."
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}  // Enter to send
                    />
                    <button className="btn btn-primary" onClick={sendMessage}>
                      Send
                    </button>
                  </div>
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