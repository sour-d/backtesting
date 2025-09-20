const fetchLiveStrategies = () => {
  return fetch("/api/live-strategies-list").then((response) => response.json());
};

const addLiveStrategies = async () => {
  const liveStrategies = await fetchLiveStrategies();
  // Strategies data fetched successfully

  const tableTbody = document.getElementById("live-strategies-table");
  Object.keys(liveStrategies).forEach((strategyKey, index) => {
    const tr = document.createElement("tr");

    const tdIndex = document.createElement("td");
    tdIndex.textContent = index + 1;
    tr.appendChild(tdIndex);

    const tdName = document.createElement("td");
    const aName = document.createElement("a");
    aName.className = "link-primary link-underline-opacity-25";
    aName.style.textDecoration = "none";
    aName.target = "_blank";
    aName.href = `/live/log?strategy=${strategyKey}`;
    aName.textContent = strategyKey;
    tdName.appendChild(aName);
    tr.appendChild(tdName);

    tableTbody.appendChild(tr);
  });
};

addLiveStrategies();
