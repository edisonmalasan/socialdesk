// scripts/hashTool.js
const bcrypt = require('bcryptjs');

const textToHash = process.argv[2]; // Gets the text from the terminal command

if (!textToHash) {
  console.log("Usage: node scripts/hashTool.js <your_text>");
  process.exit(1);
}

const saltRounds = 10;

bcrypt.hash(textToHash, saltRounds, (err, hash) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("--- BCRYPT HASH ---");
  console.log(hash);
  console.log("-------------------");
});