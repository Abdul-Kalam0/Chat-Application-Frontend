import React from "react";

const MessageList = ({ messages, user }) => {
  return (
    <div>
      {messages.map((msg, index) => {
        const isSender = msg.sender === user.username;

        return (
          <div
            key={index}
            className={`d-flex mb-2 ${
              isSender ? "justify-content-end" : "justify-content-start"
            }`}
          >
            <div
              className={`p-2 rounded shadow-sm ${
                isSender ? "bg-primary text-white" : "bg-light"
              }`}
              style={{ maxWidth: "70%" }}
            >
              <small className="fw-bold d-block">{msg.sender}</small>
              <span>{msg.message}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
