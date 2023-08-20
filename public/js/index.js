const handelResponse = (res) => {
  const toast = document.getElementById("resultToast");
  const toastBody = document.querySelector("#resultToast .toast-body");
  if (res.status === "OK") {
    toastBody.innerHTML = "Strategy ran successfully";
    toast.classList.remove("bg-danger");
    toast.classList.add("bg-success");
    main();
  } else {
    toastBody.innerHTML = "Something went wrong";
    toast.classList.add("bg-danger");
    toast.classList.remove("bg-success");
  }

  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);
  toastBootstrap.show();
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
  const strategies = await fetch("/api/strategies").then((res) => res.json());
  strategies.forEach(createOptions);
  document
    .querySelector("#runStrategyBtn")
    .addEventListener("click", runStrategy);

  main();
};
