import React, { useEffect, useRef } from "react";

const MessageList = ({ messages, user }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="message-list">
      {messages.map((msg) => {
        const isMe = msg.sender === user.username;

        return (
          <div
            key={msg._id || msg.createdAt}
            className={`message-row ${isMe ? "me" : "other"}`}
          >
            <div className="message-bubble">
              {!isMe && <div className="sender">{msg.sender}</div>}
              <div className="text">{msg.message}</div>

              {msg.createdAt && (
                <div className="time">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
