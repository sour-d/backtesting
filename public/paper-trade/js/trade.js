let validPairs = [];

fetch("https://api.binance.com/api/v3/exchangeInfo")
  .then((response) => response.json())
  .then((data) => {
    validPairs = data.symbols.map((s) => s.symbol);
  });

const startPaperTrade = (event) => {
  event.stopPropagation();

  const url = "/api/paper-trade";
  const formData = new FormData(document.querySelector("form"));

  if (!validPairs.includes(formData.get("symbol").toUpperCase())) {
    return alert("Invalid symbol");
  }

  fetch(url, {
    method: "POST",
    body: JSON.stringify(Object.fromEntries(formData)),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.id) {
        return window.location.reload();
      }
      alert(res.message);
    });
};

const parseTitle = (camelCase) => {
  const title = camelCase.replace(/([A-Z])/g, " $1");
  return title.charAt(0).toUpperCase() + title.slice(1);
};

const createOptions = (strategy) => {
  const strategyInput = document.querySelector("#strategy");
  const option = document.createElement("option");
  option.innerHTML = parseTitle(strategy);
  option.value = strategy;
  strategyInput.appendChild(option);
};

const createConfigInput = (key, value) => {
  const div = document.createElement("div");
  div.className = "form-group mb-3 config col-6";

  const label = document.createElement("label");
  label.innerHTML = parseTitle(key);
  div.appendChild(label);

  const input = document.createElement("input");
  input.classList = "form-control";
  input.type = "number";
  input.name = key;
  input.value = value;
  input.required = true;
  div.appendChild(input);
  return div;
};

const renderConfigs = (strategies) => (event) => {
  document.querySelectorAll(".config").forEach((el) => el.remove());
  const strategy = event.target.value;
  const { keys, defaultValue } = strategies[strategy]._config;
  keys.forEach((key, index) => {
    const input = createConfigInput(key, defaultValue[index]);
    document.querySelector("#configs").appendChild(input);
  });
};

const timeAgo = (timestamp) => dayjs(timestamp).fromNow();

const createTableRow = (activeStrategy, rowNumber) => {
  return `
      <tr>
        <td>${rowNumber}</td>
        <td>${activeStrategy.symbol}</td>
        <td>${activeStrategy.timeFrame}</td>
        <td>${activeStrategy.strategy}</td>
        <td>${timeAgo(activeStrategy.startTime)}</td>
        <td>
          <button id="${activeStrategy.id}" class="btn btn-link">
            View
          </button>
        </td>
      </tr>
    `;
};

const createTable = (data) => {
  data = data.sort((a, b) => b.startTime - a.startTime);

  data.forEach((activeStrategy, index) => {
    document.querySelector("tbody").innerHTML += createTableRow(
      activeStrategy,
      index + 1
    );
    document
      .getElementById(activeStrategy.id)
      .addEventListener("click", () => viewResult(activeStrategy.id));
  });
};

const viewResult = (id) => {
  window.location.href = `/paper-trade/result?id=${id}`;
};

const initiateTableCreation = () =>
  fetch("/api/paper-trade/list")
    .then((res) => res.json())
    .then((res) => createTable(res))
    .catch((err) => alert(err.message));

document.body.onload = async () => {
  dayjs.extend(dayjs_plugin_relativeTime);

  fetch("/api/strategies")
    .then((res) => res.json())
    .then((strategies) => {
      Object.keys(strategies).forEach(createOptions);
      document
        .querySelector("#strategy")
        .addEventListener("change", renderConfigs(strategies));
    });

  fetch("/api/paper-trade/list")
    .then((res) => res.json())
    .then((res) => createTable(res))
    .catch((err) => alert(err.message));

  document
    .querySelector("#runStrategyBtn")
    .addEventListener("click", startPaperTrade);
};
