import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import MessageList from "./MessageList";

const BASE_URL = "https://chat-application-backend-7lg7.onrender.com";
// const BASE_URL = "http://localhost:5001";

// 🔒 FORCE WEBSOCKET + RECONNECT
const socket = io(BASE_URL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 10,
});

export const Chat = ({ user, setUser }) => {
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  // ✅ JOIN ROOM (and rejoin on reconnect)
  useEffect(() => {
    if (!user?.username) return;

    socket.emit("join", user.username);

    socket.on("connect", () => {
      socket.emit("join", user.username);
    });

    return () => {
      socket.off("connect");
    };
  }, [user.username]);

  // fetch users
  useEffect(() => {
    axios
      .get(`${BASE_URL}/users`, {
        params: { currentUser: user.username },
      })
      .then((res) => setUsers(res.data));
  }, [user.username]);

  // receive messages (NO duplicates)
  useEffect(() => {
    const handler = (msg) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === msg._id);
        return exists ? prev : [...prev, msg];
      });
    };

    socket.on("receive_message", handler);
    return () => socket.off("receive_message", handler);
  }, []);

  // fetch history
  const fetchMessages = async (receiver) => {
    const { data } = await axios.get(`${BASE_URL}/messages`, {
      params: { sender: user.username, receiver },
    });
    setMessages(data);
    setCurrentChat(receiver);
  };

  // send message (NO local duplicate)
  const sendMessage = () => {
    if (!currentMessage.trim() || !currentChat) return;

    socket.emit(
      "send_message",
      {
        sender: user.username,
        receiver: currentChat,
        message: currentMessage,
      },
      (ack) => {
        if (!ack?.success) {
          console.error("Delivery failed");
        }
      }
    );

    setCurrentMessage("");
  };

  // logout
  const logout = () => {
    socket.disconnect();
    setUser(null);
  };

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between mb-3">
        <h4>Welcome, {user.username}</h4>
        <button className="btn btn-danger" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="row">
        <div className="col-md-3">
          <div className="list-group">
            {users.map((u) => (
              <button
                key={u._id}
                className={`list-group-item ${
                  currentChat === u.username ? "active" : ""
                }`}
                onClick={() => fetchMessages(u.username)}
              >
                {u.username}
              </button>
            ))}
          </div>
        </div>

        <div className="col-md-9">
          {currentChat ? (
            <>
              <MessageList messages={messages} user={user} />

              <div className="input-group mt-3">
                <input
                  className="form-control"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button className="btn btn-primary" onClick={sendMessage}>
                  Send
                </button>
              </div>
            </>
          ) : (
            <p>Select a user to start chat</p>
          )}
        </div>
      </div>
    </div>
  );
};
