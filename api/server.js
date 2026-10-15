const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const { base64url } = require("./helpers");
const app = express();
const port = 3000;
const jwtSecret =
  "vTSwDdzapAQyst1ptUqgoWbh4Eea2Fct/cPgkuvvG0hBjZL2hW7JtiM2MgjELIV2mTuHY0RfN6FMxbTF0fD9WzZQSAYIYZ+EH8FEQEx5TkkcWzcMqbH7HIbj5au99e8xWf7jHEGcnQ8ikwNctCG8O+mP+DzHxAeUIack6cKo+wrsRe3KW+gXK+HtIpyUZBD8C+RY7B1n856FFq+oNO81qEUxLi5jlZkhh00dK6ZveYfe8OvrOJ6Rc0vDEE1UuYBwEltkfpunI+D8S8KuIWp5wxPHOPOTlEBZCDp1rj/iZzB8Cxk6UTvLyHrBie6p1HxGvpDYJQq4W5CUQpLf5Cdp6w==";
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessions = {};
// Fake DataBase
const db = {
  users: [
    {
      id: 1,
      email: "nguyenvana@gmail.com",
      password: "123456",
      name: "Nguyễn Văn A",
    },
  ],
  posts: [
    {
      id: 1,
      title: "Title 1",
      description: "Description 1",
    },
    {
      id: 2,
      title: "Title 2",
      description: "Description 2",
    },
    {
      id: 3,
      title: "Title 3",
      description: "Description 3",
    },
  ],
};

// [GET] /api/posts
app.get("/api/posts", (req, res) => {
  res.json(db.posts);
});

// [POST] /api/auth/login
app.post("/api/auth/login", (req, res) => {
  // console.log(req);
  const { email, password } = req.body;
  const user = db.users.find(
    (user) => user.email === email && user.password === password,
  );

  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const payload = {
    sub: user.id,
    exp: Date.now() + 3600000, //Time second from 1/1/1970 to now + second
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));

  const tokenData = `${encodedHeader}.${encodedPayload}`;

  const hmac = crypto.createHmac("sha256", jwtSecret);

  const signature = hmac.update(tokenData).digest("base64url");

  res.json({
    token: `${tokenData}.${signature}`,
  });
});

//// [GET] /api/auth/me
app.get("/api/auth/me", (req, res) => {
  const token = req.headers.authorization?.slice(7);
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  // Check Signature
  const [encodedHeader, encodedPayload, tokenSignature] = token.split(".");

  const tokenData = `${encodedHeader}.${encodedPayload}`;

  const hmac = crypto.createHmac("sha256", jwtSecret);

  const signature = hmac.update(tokenData).digest("base64url");

  if (signature !== tokenSignature) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  // Decode base64url payload
  const payload = JSON.parse(
    Buffer.from(encodedPayload, "base64url").toString("utf-8"),
  );

  // Check token expiration
  if (payload.exp && Date.now() > payload.exp) {
    return res.status(401).json({
      message: "Token has expired",
    });
  }

  // Find user by id stored in payload.sub
  const user = db.users.find((user) => user.id === payload.sub);
  if (!user) {
    return res.status(401).json({
      message: "Unauthorized-user",
    });
  }

  // Return user without password
  const { password, ...safeUser } = user;
  res.json(safeUser);
});

app.listen(port, () => {
  console.log(`Demo app is running on port ${port}`);
});
