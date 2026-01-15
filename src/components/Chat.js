import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import MessageList from "./MessageList";

const BASE_URL = "https://chat-application-backend-001.vercel.app";
const socket = io(BASE_URL, { transports: ["websocket"] });

export const Chat = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    socket.emit("join", user.username);
  }, [user.username]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${BASE_URL}/users`, {
          params: { currentUser: user.username },
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUsers();

    socket.on("receive_message", (msg) => {
      if (msg.sender === currentChat || msg.receiver === currentChat) {
        setMessages(prev => [...prev, msg]);
      }
    });

    return () => socket.off("receive_message");
  }, [currentChat, user.username]);

  const fetchMessages = async (receiver) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${BASE_URL}/messages`, {
        params: { sender: user.username, receiver },
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(data);
      setCurrentChat(receiver);
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = () => {
    if (!currentMessage.trim()) return;

    socket.emit("send_message", {
      sender: user.username,
      receiver: currentChat,
      message: currentMessage
    });

    setCurrentMessage("");
  };

  return (
    <div className="container mt-3">
      <h3>Welcome, {user.username}</h3>

      <div className="row">
        <div className="col-md-4">
          <div className="list-group">
            {users.map(u => (
              <button
                key={u._id}
                className={`list-group-item ${currentChat === u.username ? "active" : ""}`}
                onClick={() => fetchMessages(u.username)}
              >
                {u.username}
              </button>
            ))}
          </div>
