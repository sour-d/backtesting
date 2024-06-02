const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
        class="bi bi-trash3-fill" viewBox="0 0 16 16">
        <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z"/>
      </svg>`;

const fetchDownloadedDataList = () => {
  return fetch("/api/downloaded-data")
    .then((response) => response.json())
    .catch((error) => {
      console.log(error);
    });
};

const createTable = (data) => {
  const tbody = document.getElementById("downloaded-data-table");
  const rows = Object.keys(data).forEach((category) => {
    const heading = `<tr class="table-primary">
      <th scope="col" colspan="6">${category}</th>
    </tr>`;
    tbody.innerHTML += heading;

    data[category].forEach((item) => {
      tbody.innerHTML += `<tr>
        <td>${item?.name}</td>
        <td>${item?.symbol}</td>
        <td>${item?.timeFrame || "1D"}</td>
        <td>${item?.from}</td>
        <td>${item?.to}</td>
        <td><button class="btn btn-link link-danger link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover">${svg}</button></td>
      </tr>`;
    });
  });
};

const main = () => {
  fetchDownloadedDataList().then(createTable);
};
