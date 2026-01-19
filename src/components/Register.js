import React, { useState } from "react";
import axios from "axios";

const BASE_URL = "https://chat-application-backend-7lg7.onrender.com";
//const BASE_URL = "http://localhost:5001";

const Register = ({ setUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleRegister = async () => {
    try {
      setIsError(false);
      const { data } = await axios.post(`${BASE_URL}/auth/register`, {
        username,
        password,
      });

      setRegistrationMessage(
        "You are registered successfully. Proceed to login."
      );
      setUser(data);
    } catch (error) {
      setIsError(true);
      setRegistrationMessage(
        error.response?.data?.message || "Error registering user"
      );
    } finally {
      setTimeout(() => setRegistrationMessage(""), 2000);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center h-100">
      <div className="card shadow-lg w-100" style={{ maxWidth: "420px" }}>
        <div className="card-body p-4">
          <h3 className="text-center mb-2">Register</h3>
          <p className="text-center text-muted mb-4">
            Create an account to start chatting
          </p>

          {registrationMessage && (
            <div
              className={`alert ${
                isError ? "alert-danger" : "alert-success"
              } text-center py-2`}
            >
              {registrationMessage}
            </div>
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
              onClick={handleRegister}
              disabled={!username || !password}
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
