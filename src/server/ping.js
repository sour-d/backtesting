import axios from "axios";
import fs from "fs";

const pingWebsite = async (url) => {
  try {
    const response = await axios.get(url);
    fs.writeFileSync(
      "ping-log.txt",
      `<li>${response.data} ${new Date().toLocaleString()}</li>\n`,
      { flag: "a", encoding: "utf8" }
    );
  } catch (error) {
    console.error(error);
  }
};

const startPingInInterval = () => {
  setImmediate(() => {
    pingWebsite(process.env.KEEP_ALIVE + "/ping");
  });
  setInterval(() => {
    pingWebsite(process.env.URL + "/ping");
  }, 60000);
};

export default startPingInInterval;
