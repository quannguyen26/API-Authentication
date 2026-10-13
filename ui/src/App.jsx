import { useState } from "react";
// import "./App.css";
import { useEffect } from "react";
const baseApi = "http://localhost:3000/api";
function App() {
  const [user, setUser] = useState(null);
  const [fields, setFields] = useState({
    email: "nguyenvana@gmail.com",
    password: "123456",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${baseApi}/auth/me`, {
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then((res) => {
        setUser(res);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const setFieldValue = ({ target: { name, value } }) => {
    setFields((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = (e) => {
    e.preventDefault();

    setError("");

    fetch(`${baseApi}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(fields),
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then((user) => console.log(user))
      .catch((error) => {
        if (error.status === 401) {
          return setError("Email hoặc Mật khẩu không chính xác");
        }
        setError("Lỗi không xác định ! Liên hệ trợ giúp");
      });
  };
  return (
    <div>
      {user ? (
        <h1>Xin chào, {user.name}</h1>
      ) : (
        <>
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            <label htmlFor="email">Email</label>
            <br />
            <input
              type="email"
              name="email"
              value={fields.email}
              onChange={setFieldValue}
              id="email"
            />{" "}
            <br />
            <label htmlFor="password">Password</label> <br />
            <input
              type="password"
              name="password"
              value={fields.password}
              onChange={setFieldValue}
              id="password"
            />{" "}
            <br /> <br />
            <button>Login</button>
          </form>

          {!!error && <p style={{ color: "red" }}>{error}</p>}
        </>
      )}
    </div>
  );
}

export default App;
