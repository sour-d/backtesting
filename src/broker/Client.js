import { RestClientV5 } from "bybit-api";
import dotenv from "dotenv";
dotenv.config();

class Client {
  static #client = null;
  static async getClient() {
    if (!this.#client) {
      this.#client = new RestClientV5({
        key: process.env.TESTNET_API_KEY,
        secret: process.env.TESTNET_API_SECRET,
        parseAPIRateLimits: true,
        testnet: true,
        // demoTrading: true,
      });
    }
    return this.#client;
  }
}

export default Client;
