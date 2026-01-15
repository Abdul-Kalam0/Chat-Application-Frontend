import React from "react";

const MessageList = ({ messages, user }) => {
  return (
    <div>
      {messages.map((msg, index) => (
        <div
          key={msg._id || index} // Use _id if available for better uniqueness
          className={`alert mb-2 ${
            msg.sender === user.username
              ? "alert-success text-end" // Sent messages: green, right-aligned
              : "alert-secondary" // Received: gray, left-aligned
          }`}
          style={{
            maxWidth: "75%",
            marginLeft: msg.sender === user.username ? "auto" : "0",
          }}
        >
          <strong>{msg.sender}: </strong>
          {msg.message}
        </div>
      ))}
    </div>
  );
};

export default MessageList;
