const axios = require("axios").default;
const dotenv = require("dotenv");
dotenv.config();

const main = () => {
  axios.get(process.env.PING_URL).then((res) => {});
};

console.log("Pinging URL: ", process.env.PING_URL);
setTimeout(() => setInterval(main, 60000), 10000);