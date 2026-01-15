import React from "react";

const MessageList = ({ messages, user }) => {
  return (
    <div>
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`alert ${
            msg.sender === user.username
              ? "alert-success text-end"
              : "alert-secondary"
          } mb-2`}
        >
          <strong>{msg.sender}: </strong>
          {msg.message}
        </div>
      ))}
    </div>
  );
};

export default MessageList;
