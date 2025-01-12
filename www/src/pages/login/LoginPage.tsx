import React, { useEffect, useState } from "react";
import styles from "./LoginPage.module.css";
import { routes } from "routes";
import { useStores } from "models";
import { useNavigate } from "react-router";

export const LoginPage = () => {
  const { userStore } = useStores();
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    userStore.isLoggedIn().then((isLoggedIn) => {
      if (isLoggedIn) routes.editor.path({ queryArgs: { commodity: undefined } }).open(navigate);
    });
  }, [userStore, navigate]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await userStore.login(username, password);
      routes.editor.path({ queryArgs: { commodity: undefined } }).open(navigate);
    } catch (err) {
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h2>Login</h2>
      <form onSubmit={handleLogin} className={styles.loginForm}>
        <div className={styles.formGroup}>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button
          type="submit"
          style={{
            marginTop: "10px",
            backgroundColor: "#0077b6",
            color: "white",
            fontSize: "1rem",
            fontWeight: "bold",
          }}
        >
          Login
        </button>
      </form>

    </div>
  );
};