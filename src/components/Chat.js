import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import MessageList from "./MessageList";

const BASE_URL = "https://chat-application-backend-7lg7.onrender.com";
//const BASE_URL = "http://localhost:5001";

const socket = io(BASE_URL, {
  transports: ["websocket"],
  reconnection: true,
});

const emojis = ["😀", "😂", "😍", "😊", "👍", "🔥", "❤️", "🎉"];

export const Chat = ({ user, setUser }) => {
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [typingUser, setTypingUser] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  /* ================= JOIN ================= */
  useEffect(() => {
    socket.emit("join", user.username);
    socket.on("online_users", setOnlineUsers);
    return () => socket.off("online_users");
  }, [user.username]);

  /* ================= USERS ================= */
  useEffect(() => {
    axios
      .get(`${BASE_URL}/users`, {
        params: { currentUser: user.username },
      })
      .then((res) => setUsers(res.data));
  }, [user.username]);

  /* ================= RECEIVE MESSAGE ================= */
  useEffect(() => {
    const handler = (msg) => {
      if (msg.sender === currentChat || msg.receiver === currentChat) {
        setMessages((prev) =>
          prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]
        );
      }
    };

    socket.on("receive_message", handler);
    return () => socket.off("receive_message", handler);
  }, [currentChat]);

  /* ================= TYPING ================= */
  useEffect(() => {
    socket.on("typing", ({ sender }) => {
      if (sender === currentChat) setTypingUser(sender);
    });
    socket.on("stop_typing", () => setTypingUser(null));

    return () => {
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, [currentChat]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  /* ================= FETCH CHAT ================= */
  const fetchMessages = async (receiver) => {
    const { data } = await axios.get(`${BASE_URL}/messages`, {
      params: { sender: user.username, receiver },
    });
    setMessages(data);
    setCurrentChat(receiver);
  };

  /* ================= SEND MESSAGE ================= */
  const sendMessage = () => {
    if (!currentMessage.trim()) return;

    socket.emit("send_message", {
      sender: user.username,
      receiver: currentChat,
      message: currentMessage,
    });

    socket.emit("stop_typing", {
      sender: user.username,
      receiver: currentChat,
    });

    setCurrentMessage("");
  };

  const handleTyping = (e) => {
    setCurrentMessage(e.target.value);

    socket.emit("typing", {
      sender: user.username,
      receiver: currentChat,
    });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stop_typing", {
        sender: user.username,
        receiver: currentChat,
      });
    }, 700);
  };

  const logout = () => {
    socket.disconnect();
    setUser(null);
  };

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-xl-10">
          {/* 🔒 FIXED HEIGHT CARD */}
          <div className="card shadow rounded-4" style={{ height: "82vh" }}>
            {/* 🔒 ROW MUST NOT OVERFLOW */}
            <div className="row g-0 h-100" style={{ minHeight: 0 }}>
              {/* SIDEBAR */}
              <div className="col-4 border-end bg-light overflow-auto">
                <div className="p-3 fw-semibold text-secondary border-bottom">
                  Chats
                </div>

                <div className="list-group list-group-flush">
                  {users.map((u) => (
                    <button
                      key={u._id}
                      className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                        currentChat === u.username ? "active" : ""
                      }`}
                      onClick={() => fetchMessages(u.username)}
                    >
                      <span>{u.username}</span>
                      <span
                        className={`badge ${
                          onlineUsers[u.username]
                            ? "bg-success"
                            : "bg-secondary"
                        }`}
                      >
                        {onlineUsers[u.username] ? "Online" : "Offline"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* CHAT */}
              <div
                className="col-8 d-flex flex-column overflow-hidden"
                style={{ minHeight: 0 }}
              >
                {/* HEADER */}
                <div className="px-4 py-3 border-bottom bg-white d-flex justify-content-between">
                  <div>
                    <h6 className="mb-0">{currentChat || "Select a chat"}</h6>
                    {onlineUsers[currentChat] && (
                      <small className="text-success">Online</small>
                    )}
                  </div>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </div>

                {/* 🔥 SCROLLABLE MESSAGES */}
                <div
                  className="flex-grow-1 px-4 py-3 bg-body-tertiary"
                  style={{
                    overflowY: "auto",
                    minHeight: 0,
                  }}
                >
                  <MessageList messages={messages} user={user} />
                  {typingUser && (
                    <small className="text-muted fst-italic">
                      {typingUser} is typing…
                    </small>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* INPUT */}
                {currentChat && (
                  <div className="border-top p-3 bg-white">
                    <div className="mb-2">
                      {emojis.map((e) => (
                        <button
                          key={e}
                          className="btn btn-light btn-sm me-1"
                          onClick={() => setCurrentMessage((p) => p + e)}
                        >
                          {e}
                        </button>
                      ))}
                    </div>

                    <div className="input-group">
                      <input
                        className="form-control"
                        placeholder="Type a message…"
                        value={currentMessage}
                        onChange={handleTyping}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      />
                      <button className="btn btn-primary" onClick={sendMessage}>
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
