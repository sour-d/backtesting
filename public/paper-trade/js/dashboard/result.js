const GREEN = "#6dc66d";
const RED = "#ff6060";
const DARK_RED = "#b20000";

const parseTitle = (camelCase) => {
  const title = camelCase.replace(/([A-Z])/g, " $1");
  return title.charAt(0).toUpperCase() + title.slice(1);
};

const generateReport = (report) => {
  document.querySelector("#report").innerHTML = "";
  Object.entries(report).forEach(([itemName, item]) => {
    const p = document.createElement("tr");
    p.innerHTML = `<td>${parseTitle(itemName)}</td><td>${item}</td>`;
    document.querySelector("#report").appendChild(p);
  });
};

const updatedTotalTrades = (data) => {
  const totalTradesEle = document.getElementById("total-trades");
  totalTradesEle.innerText = `Total Trades : ${data.length}`;
};

const fetchLiveData = async () => {
  const id = new URLSearchParams(window.location.search).get("id");
  const url = `ws://localhost:3000/api/paper-trade/${id}`;
  const ws = new WebSocket(url);
  ws.onopen = () => {
    console.log("connected");
  };
  ws.onmessage = (event) => {
    console.log("ws message: ", JSON.parse(event.data));
    const { type, data } = JSON.parse(event.data);
    if (type === "data") {
      updateActiveTradeWithLiveData(data);
      return;
    }
    updateActiveTrade(type, data);
  };
  ws.onclose = () => {
    console.log("disconnected");
  };
  ws.onerror = (err) => {
    console.log(err);
  };
};

const updateActiveTradeWithLiveData = (data) => {
  if (!document.querySelector("#currentPrice") || !activeTrade) return;

  const profit = twoFloatingPoints(data.Close - activeTrade.price);
  const profitPercentage = twoFloatingPoints(profit / activeTrade.price);
  const symbol = profit > 0 ? "+" : "-";
  const color = profit > 0 ? "text-success" : "text-danger";

  document.querySelector("#currentPrice").innerText = data.Close;
  document.querySelector(
    "#pnl-percentage"
  ).innerHTML = `<h1 class="${color}">${symbol}${profitPercentage}%</h1>`;
  document.querySelector("#pnl").innerText = profit;
};

let activeTrade = null;

const updateActiveTrade = (type, data) => {
  if (type === "sell") {
    console.log("got sold", data);
    activeTrade = null;
    document.querySelector("#activeTrade").innerHTML =
      "<p>No active trade found<p>";
    return;
  }
  console.log("got buy", data);
  Object.keys(data).forEach((key) => {
    if (!data[key]) return;
    data[key] = twoFloatingPoints(data[key]);
  });

  const activeTradeDiv = `
  <div class="col-4 border-end text-center d-flex flex-column justify-content-center align-items-center">
    <div id="pnl-percentage" class=""><h1>Calculating ...</h1></div>
    <p>P&L</p>
  </div>
  <div class="col-8 row">
    <div class="d-flex flex-column col-6">
      <p>Quantity: ${data.quantity}</p>
      <p>Bought At: ${data.quantity * data.price}</p>
      <p>Current price: <span id="currentPrice">${data.price}</span></p>
    </div>
    <div class="d-flex flex-column col-6">
      <p>Risk: ${data.risk}</p>
      <p>Profit: <span id="pnl">${data.risk}</span></p>
    </div>
  `;

  document.querySelector("#activeTrade").innerHTML = activeTradeDiv;
  activeTrade = data;
};

const twoFloatingPoints = (float) => +float.toFixed(2);

const main = async () => {
  const { tradeInfo, trades } = await getResult();

  generateReport(tradeInfo);

  const data = transformTradesData(trades, tradeInfo.timeFrame);
  drawProfitLossChart(data);
  drawTotalProfitOverTime(data);
  drawDurationProfitChart(data);
  drawRiskRewardChart(data);
  drawAccumulatedRewardChart(data);
  drawDrawDownChart(data);
};
