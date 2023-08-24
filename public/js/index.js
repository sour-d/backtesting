const handelResponse = (res) => {
  if (res.status === "OK") {
    window.open("/result.html");
  } else {
    alert("Something went wrong");
  }
};

const runStrategy = (event) => {
  event.stopPropagation();

  const strategy = document.querySelector("#strategy").value;
  const url = `/api/strategies`;
  const formData = new FormData(document.querySelector("form"));

  fetch(url, {
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

document.body.onload = async () => {
  fetch("/api/strategies")
    .then((res) => res.json())
    .then((strategies) => {
      Object.keys(strategies).forEach(createOptions);
      document
        .querySelector("#strategy")
        .addEventListener("change", renderConfigs(strategies));
    });

  document
    .querySelector("#runStrategyBtn")
    .addEventListener("click", runStrategy);
};
