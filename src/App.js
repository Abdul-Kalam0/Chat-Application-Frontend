import React, { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import { Chat } from "./components/Chat";
import "bootstrap/dist/js/bootstrap.min.js";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  const [user, setUser] = useState(null);

  return (
    <div className="app">
      <h1 className="text-center my-4">Chat App</h1>

      {!user ? (
        <div className="container mt-5 text-center">
          <div className="row justify-content-center">
            <div className="col-md-6 mb-4">
              <Register setUser={setUser} />
            </div>
            <div className="col-md-6 mb-4">
              <Login setUser={setUser} />
            </div>
          </div>
        </div>
      ) : (
        <Chat user={user} setUser={setUser} />
      )}
    </div>
  );
};

export default App;
