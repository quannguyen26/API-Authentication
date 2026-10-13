const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const port = 3000;

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

  const sessionId = Date.now().toString();
  sessions[sessionId] = { sub: user.id };
  res
    .setHeader("Set-Cookie", `sessionId=${sessionId}; httpOnly; Max-Age=3600`)
    .json(user);
});

//// [GET] /api/auth/me
app.get("/api/auth/me", (req, res) => {
  const session = sessions[req.cookies.sessionId];
  // console.log(req.cookies.sessionId);
  // console.log(sessions);
  if (!session) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  const user = db.users.find((user) => user.id === session.sub);
  if (!user) {
    return res.status(401).json({
      message: "Unauthorized-user",
    });
  }

  res.json(user);
});

app.listen(port, () => {
  console.log(`Demo app is running on port ${port}`);
});
