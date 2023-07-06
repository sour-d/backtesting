const htmlTag = ({ tag, classList, id, body }) => {
  const elm = document.createElement(tag);
  if (id) {
    elm.id = id;
  }

  if (body && Array.isArray(body)) {
    body.forEach((b) => {
      elm.appendChild(b);
    });
  } else {
    elm.innerHTML = body;
  }

  if (classList && Array.isArray(classList)) {
    classList.forEach((c) => {
      elm.classList.add(c);
    });
  }
  return elm;
};

const createSymbolRow = (name, symbol) => {
  const tdName = htmlTag({ tag: "td", body: name });
  const tdSymbol = htmlTag({ tag: "td", body: symbol });
  const tdTotalProfitLoss = htmlTag({ tag: "td", body: 0 });
  const tdXIRR = htmlTag({ tag: "td", body: 0 });
  const tr = htmlTag({
    tag: "tr",
    body: [tdName, tdSymbol, tdTotalProfitLoss, tdXIRR],
  });
  tr.onclick = () =>
    (window.location.href = `${location.origin}/src/web/TradeResult.html?name=${name}`);

  return tr;
};

const createCategoryHeading = (categoryName) => {
  const categoryTh = htmlTag({
    tag: "th",
    body: categoryName,
    classList: ["bg-secondary", "text-white"],
  });
  categoryTh.setAttribute("colspan", "4");
  const categoryTr = htmlTag({ tag: "tr", body: [categoryTh] });
  return categoryTr;
};

const makeTable = () => {
  fetch("/symbolList.json")
    .then((res) => res.json())
    .then((symbolInfo) => {
      const tbody = document.getElementById("TradedResultTbody");

      Object.keys(symbolInfo).forEach((categoryName) => {
        const categoryTr = createCategoryHeading(categoryName);
        tbody.appendChild(categoryTr);

        const symbols = symbolInfo[categoryName];
        symbols.forEach(({ name, symbol }) => {
          const tr = createSymbolRow(name, symbol);
          tbody.appendChild(tr);
        });
      });
    });
};

makeTable();
