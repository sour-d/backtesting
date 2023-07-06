const { app } = require("./build/app.js");
const symbolList = require("./symbolList.json");

app(symbolList);
