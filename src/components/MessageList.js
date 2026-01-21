import React from "react";
const MessageList = ({ messages, user }) => {
  return (
    <>
      {messages.map((msg) => {
        const isMe = msg.sender === user.username;
        const time = new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={msg._id}
            className={`d-flex mb-3 ${
              isMe ? "justify-content-end" : "justify-content-start"
            }`}
          >
            <div
              className={`px-3 py-2 rounded-3 ${
                isMe ? "bg-primary text-white" : "bg-white border"
              }`}
              style={{ maxWidth: "65%" }}
            >
              <div className="mb-1">{msg.message}</div>
              <small className="text-muted d-block text-end">{time}</small>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default MessageList;
