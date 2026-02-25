const db = require("../db");
const jwt = require("jsonwebtoken");

exports.adminLogin = (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM admins WHERE username = ?";
  db.query(sql, [username], (err, results) => {
  if (err) {
  console.error("DB ERROR:", err);
  return res.status(500).json({ error: err.message });
}

    if (results.length === 0) {
      return res.status(401).send("Admin not found");
    }

    const admin = results[0];

    if (admin.password !== password) {
      return res.status(401).send("Invalid password");
    }

    const token = jwt.sign(
      { id: admin.id },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    res.json({ token });
  });
};