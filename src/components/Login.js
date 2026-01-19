import React, { useState } from "react";
import axios from "axios";

const BASE_URL = "https://chat-application-backend-7lg7.onrender.com";
//const BASE_URL = "http://localhost:5001";

const Login = ({ setUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setError("");
      const { data } = await axios.post(`${BASE_URL}/auth/login`, {
        username,
        password,
      });
      setUser(data);
    } catch (error) {
      setError(error.response?.data?.message || "Error logging in");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center h-100">
      <div className="card shadow-lg w-100" style={{ maxWidth: "420px" }}>
        <div className="card-body p-4">
          <h3 className="text-center mb-2">Login</h3>
          <p className="text-center text-muted mb-4">
            Login with your credentials to continue
          </p>

          {error && (
            <div className="alert alert-danger py-2 text-center">{error}</div>
          )}

          <div className="mb-3">
            <label className="form-label">
              <h4>Username</h4>
            </label>
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              <h4>Password</h4>
            </label>
            <input
              type="password"
              className="form-control form-control-lg"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="d-grid">
            <button
              className="btn btn-success btn-lg"
              onClick={handleLogin}
              disabled={!username || !password}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
