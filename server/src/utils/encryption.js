const crypto = require("crypto");
const fs = require("fs");

const algorithm = "aes-256-cbc";
const secretKey =
  process.env.FILE_SECRET || "12345678901234567890123456789012"; // 32 chars
const ivLength = 16;

// 🔐 Encrypt File
const encryptFile = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    const iv = crypto.randomBytes(ivLength);

    const cipher = crypto.createCipheriv(
      algorithm,
      Buffer.from(secretKey),
      iv
    );

    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);

    output.write(iv); // Save IV at start

    input
      .pipe(cipher)
      .pipe(output)
      .on("finish", () => {
        fs.unlinkSync(inputPath); // delete original
        resolve();
      })
      .on("error", reject);
  });
};

// 🔓 Decrypt File
const decryptFile = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    const input = fs.createReadStream(inputPath);

    let iv;
    input.once("readable", () => {
      iv = input.read(ivLength);

      const decipher = crypto.createDecipheriv(
        algorithm,
        Buffer.from(secretKey),
        iv
      );

      const output = fs.createWriteStream(outputPath);

      input
        .pipe(decipher)
        .pipe(output)
        .on("finish", resolve)
        .on("error", reject);
    });
  });
};

module.exports = { encryptFile, decryptFile };