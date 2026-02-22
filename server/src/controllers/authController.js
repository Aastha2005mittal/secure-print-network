const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Register Admin (Run Once)
exports.registerAdmin = async (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO admins (username, password) VALUES (?, ?)",
    [username, hashedPassword],
    (err) => {
      if (err) return res.status(500).json({ error: "Admin already exists" });
      res.json({ message: "Admin registered successfully" });
    }
  );
};

// Login Admin
exports.loginAdmin = (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM admins WHERE username = ?",
    [username],
    async (err, results) => {
      if (err || results.length === 0)
        return res.status(400).json({ error: "Invalid credentials" });

      const admin = results[0];

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch)
        return res.status(400).json({ error: "Invalid credentials" });

      const token = jwt.sign({ id: admin.id }, JWT_SECRET, {
        expiresIn: "1d",
      });

      res.json({ message: "Login successful", token });
    }
  );
};