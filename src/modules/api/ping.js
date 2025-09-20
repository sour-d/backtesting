import axios from "axios";
import fs from "fs";

const pingWebsite = async (url) => {
  if (!fs.existsSync("ping-log.txt"))
    fs.writeFileSync(
      "ping-log.txt",
      JSON.stringify({ start: new Date().toISOString() })
    );

  const content = JSON.parse(fs.readFileSync("ping-log.txt", "utf8"));
  content.end = new Date().toISOString();
  try {
    const response = await axios.get(url);
    fs.writeFileSync("ping-log.txt", JSON.stringify(content), {
      flag: "w",
      encoding: "utf8",
    });
  } catch (error) {
    console.error(error);
  }
};

const startPingInInterval = () => {
  setImmediate(() => {
    pingWebsite(process.env.PING_URL + "/ping");
  });
  setInterval(() => {
    pingWebsite(process.env.PING_URL + "/ping");
  }, 60000);
};

export default startPingInInterval;
