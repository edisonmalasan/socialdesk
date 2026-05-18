const PORT = process.env.PORT || 5000;

const dotenv = require("dotenv");
dotenv.config();

const app = require("./src/app");

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});