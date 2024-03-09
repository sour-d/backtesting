const OUTCOME_URL = "/backtest/outcome";
const BACKTEST_API_URL = "/api/backtest";
const STRATEGIES_URL = "/api/strategies";
const AVAILABLE_DATA = "/api/available-data";

const getFileName = (stock) => {
  const {
    name,
    timeFrame = "1d",
    from = "2005-01-01",
    to = "2023-06-01",
  } = stock;

  return `${name}_${timeFrame}_${from}_${to}`;
};

const handelResponse = (res) => {
  if (res.status === "OK") {
    window.open(OUTCOME_URL);
  } else {
    alert("Something went wrong");
  }
};

const runStrategy = (event) => {
  event.stopPropagation();
  const formData = new FormData(document.querySelector("form"));

  fetch(BACKTEST_API_URL, {
    method: "POST",
    body: JSON.stringify(Object.fromEntries(formData)),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then(handelResponse);
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

const renderStockOptions = (datas) => {
  Object.keys(datas).forEach((category) => {
    datas[category].forEach((data) => {
      const name = getFileName(data);
      const op = document.createElement("option");
      op.setAttribute("value", name);
      op.innerText = name;
      document.getElementById("stock").appendChild(op);
    });
  });
};

const fetchAvailableData = () =>
  fetch(AVAILABLE_DATA)
    .then((res) => res.json())
    .then((availableDatas) => {
      renderStockOptions(availableDatas);
    });

const fetchStrategies = () =>
  fetch(STRATEGIES_URL)
    .then((res) => res.json())
    .then((strategies) => {
      Object.keys(strategies).forEach(createOptions);
      document
        .querySelector("#strategy")
        .addEventListener("change", renderConfigs(strategies));
    });

document.body.onload = async () => {
  fetchAvailableData();
  fetchStrategies();
  document
    .querySelector("#runStrategyBtn")
    .addEventListener("click", runStrategy);
};
