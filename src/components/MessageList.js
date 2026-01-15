import React from "react";

const MessageList = ({ messages, user }) => {
  return (
    <div style={{ height: "400px", overflowY: "auto" }}>
      {messages.map((msg) => (
        <div
          key={msg._id}
          className={`alert ${
            msg.sender === user.username
              ? "alert-success text-end"
              : "alert-secondary"
          }`}
        >
          <strong>{msg.sender}</strong>: {msg.message}
        </div>
      ))}
    </div>
  );
};

export default MessageList;
