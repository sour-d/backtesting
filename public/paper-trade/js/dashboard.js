const RESULT_URL = "/paper-trade/outcome";
const ACTIVE_STRATEGY_LIST_URL = "/api/paper-trade/list";
const STRATEGIES_URL = "/api/strategies";

const startPaperTrade = (event) => {
  event.stopPropagation();

  const url = "/api/paper-trade";
  const formData = new FormData(document.querySelector("form"));

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
  const tr = document.createElement("tr");
  const content = `
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
  tr.innerHTML = content;
  return tr;
};

const createTable = (data) => {
  const activeStrategies = data.sort((a, b) => b.startTime - a.startTime);

  activeStrategies.forEach((activeStrategy, index) => {
    document
      .querySelector("tbody")
      .appendChild(createTableRow(activeStrategy, index + 1));
    document
      .getElementById(activeStrategy.id)
      .addEventListener("click", viewResult.bind(null, activeStrategy.id));
  });
};

const viewResult = (id) => {
  window.location.href = `${RESULT_URL}?id=${id}`;
};

const initiateTableCreation = () =>
  fetch(ACTIVE_STRATEGY_LIST_URL)
    .then((res) => res.json())
    .then((res) => createTable(res))
    .catch((err) => alert(err.message));

document.body.onload = async () => {
  dayjs.extend(dayjs_plugin_relativeTime);

  fetch(STRATEGIES_URL)
    .then((res) => res.json())
    .then((strategies) => {
      Object.keys(strategies).forEach(createOptions);
      document
        .querySelector("#strategy")
        .addEventListener("change", renderConfigs(strategies));
    });

  fetch(ACTIVE_STRATEGY_LIST_URL)
    .then((res) => res.json())
    .then((res) => createTable(res))
    .catch((err) => alert(err.message));

  document
    .querySelector("#runStrategyBtn")
    .addEventListener("click", startPaperTrade);
};
