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

  fetch(url, {
    method: "POST",
    body: JSON.stringify({ strategy }),
  })
    .then((res) => res.json())
    .then(handelResponse);
};

const createOptions = (strategy) => {
  const strategyInput = document.querySelector("#strategy");
  const option = document.createElement("option");
  const title = strategy.replace(/([A-Z])/g, " $1");
  option.innerHTML = title.charAt(0).toUpperCase() + title.slice(1);
  option.value = strategy;
  strategyInput.appendChild(option);
};

document.body.onload = async () => {
  fetch("/api/strategies")
    .then((res) => res.json())
    .then((Strategies) => Strategies.forEach(createOptions));

  document
    .querySelector("#runStrategyBtn")
    .addEventListener("click", runStrategy);
};
