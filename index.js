const itemsPerPage = 10;
let currentPage = 1;
let totalItems = 0;
let searchDataInput = "";

const tableBody = document.getElementById("table-body");
const paginationElement = document.getElementById("pagination");
const searchInput = document.getElementById("searchInput");

function fetchData() {
  return fetch(
    "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
  )
    .then((response) => response.json())
    .catch((error) => console.error("Error fetching data:", error));
}

function renderTablePage(page, data) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = data.slice(startIndex, endIndex);

  tableBody.innerHTML = "";

  pageData.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td><input type="checkbox" class="select-checkbox"></td>
        <td contenteditable="false" class="editable">${item.name}</td>
        <td contenteditable="false" class="editable">${item.email}</td>
        <td contenteditable="false" class="editable">${item.role}</td>
        <td>
          <i class="fas fa-edit edit-btn" onclick="toggleEdit(this)"></i>
          <i class="fas fa-save save-btn" onclick="saveChanges(this)"></i>
          <i class="fas fa-trash delete-btn" onclick="deleteRow(this)"></i>
        </td>
      `;
    tableBody.appendChild(row);
  });

  updateSelectAllCheckbox();
}

function toggleSelectAll() {
  const selectAllCheckbox = document.getElementById("selectAllCheckbox");
  const checkboxes = document.querySelectorAll(".select-checkbox");

  checkboxes.forEach((checkbox) => {
    checkbox.checked = selectAllCheckbox.checked;
  });
}

function updateSelectAllCheckbox() {
  const selectAllCheckbox = document.getElementById("selectAllCheckbox");
  const checkboxes = document.querySelectorAll(".select-checkbox");

  selectAllCheckbox.checked = Array.from(checkboxes).every(
    (checkbox) => checkbox.checked
  );
}

tableBody.addEventListener("click", (event) => {
  const checkbox = event.target.closest(".select-checkbox");
  if (checkbox) {
    const row = checkbox.closest("tr");
    row.classList.toggle("selected", checkbox.checked);
    updateSelectAllCheckbox();
  }
});

function deleteSelectedRows() {
  const checkboxes = document.querySelectorAll(".select-checkbox");
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      const row = checkbox.closest("tr");
      row.remove();
      totalItems--;
    }
  });
  renderPagination(Math.ceil(totalItems / itemsPerPage));
}

function renderPagination(totalPages) {
  paginationElement.innerHTML = "";

  const firstPageBtn = document.createElement("button");
  firstPageBtn.classList.add("page-link", "pagination-btn");
  firstPageBtn.textContent = "First";
  firstPageBtn.addEventListener("click", goToFirstPage);
  const firstPageItem = document.createElement("li");
  firstPageItem.classList.add("page-item");
  firstPageItem.appendChild(firstPageBtn);
  paginationElement.appendChild(firstPageItem);

  const prevPageBtn = document.createElement("button");
  prevPageBtn.classList.add("page-link", "pagination-btn");
  prevPageBtn.textContent = "Previous";
  prevPageBtn.addEventListener("click", goToPreviousPage);
  const prevPageItem = document.createElement("li");
  prevPageItem.classList.add("page-item");
  prevPageItem.appendChild(prevPageBtn);
  paginationElement.appendChild(prevPageItem);

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.classList.add("page-item", i === currentPage ? "active" : null);
    const button = document.createElement("button");
    button.classList.add("page-link", "pagination-btn");
    button.textContent = i;
    button.addEventListener("click", () => changePage(i));
    li.appendChild(button);
    paginationElement.appendChild(li);
  }

  const nextPageBtn = document.createElement("button");
  nextPageBtn.classList.add("page-link", "pagination-btn");
  nextPageBtn.textContent = "Next";
  nextPageBtn.addEventListener("click", goToNextPage);
  const nextPageItem = document.createElement("li");
  nextPageItem.classList.add("page-item");
  nextPageItem.appendChild(nextPageBtn);
  paginationElement.appendChild(nextPageItem);

  const lastPageBtn = document.createElement("button");
  lastPageBtn.classList.add("page-link", "pagination-btn");
  lastPageBtn.textContent = "Last";
  lastPageBtn.addEventListener("click", goToLastPage);
  const lastPageItem = document.createElement("li");
  lastPageItem.classList.add("page-item");
  lastPageItem.appendChild(lastPageBtn);
  paginationElement.appendChild(lastPageItem);
}

function changePage(page) {
  currentPage = page;
  fetchData().then((data) => {
    totalItems = data.length;
    renderTablePage(currentPage, data);
    renderPagination(Math.ceil(totalItems / itemsPerPage));
  });
}

function goToFirstPage() {
  if (currentPage > 1) {
    changePage(1);
  }
}

function goToPreviousPage() {
  if (currentPage > 1) {
    changePage(currentPage - 1);
  }
}

function goToNextPage() {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (currentPage < totalPages) {
    changePage(currentPage + 1);
  }
}

function goToLastPage() {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (currentPage < totalPages) {
    changePage(totalPages);
  }
}

function deleteRow(icon) {
  const row = icon.closest("tr");
  row.remove();
  totalItems--;
  renderPagination(Math.ceil(totalItems / itemsPerPage));
}

function toggleEdit(icon) {
  const row = icon.closest("tr");
  const editableCells = row.querySelectorAll(".editable");
  editableCells.forEach((cell) => (cell.contentEditable = "true"));
}

function saveChanges(icon) {
  const row = icon.closest("tr");
  const editableCells = row.querySelectorAll(".editable");
  editableCells.forEach((cell) => (cell.contentEditable = "false"));
}

function searchData() {
  console.log("fire");
  searchDataInput = searchInput.value.trim().toLowerCase();
  fetchData().then((data) => {
    const filteredData = data.filter(
      (item) =>
        item.name.toLowerCase().includes(searchDataInput) ||
        item.email.toLowerCase().includes(searchDataInput) ||
        item.role.toLowerCase().includes(searchDataInput)
    );
    totalItems = filteredData.length;
    currentPage = 1;
    renderTablePage(currentPage, filteredData);
    renderPagination(Math.ceil(totalItems / itemsPerPage));
  });
}

document.getElementById("searchInput").addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    searchData();
  }
});

fetchData().then((data) => {
  totalItems = data.length;
  renderTablePage(currentPage, data);
  renderPagination(Math.ceil(totalItems / itemsPerPage));
});
