// scripts/hashTool.js
/*
This is a script used to generate bcrypt hashes.
Since it is not part of the apps runtime, it should not live in utils/utility
*/

const bcrypt = require("bcryptjs");

const saltRounds = 10;

exports.hashText = (textToHash) => {
  return bcrypt.hash(textToHash, saltRounds);
};

exports.runCli = () => {
  const textToHash = process.argv[2]; // Gets the text from the terminal command

  if (!textToHash) {
    console.log("Usage: node scripts/hash-tool.js <your_text>");
    process.exit(1);
  }

  bcrypt.hash(textToHash, saltRounds, (err, hash) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("--- BCRYPT HASH ---");
    console.log(hash);
    console.log("-------------------");
  });
};

if (require.main === module) {
  exports.runCli();
}
