const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const searchList = document.getElementById("search-list");
const addBtn = document.getElementById("add-btn"); 

let editMode = null; // Track the item being edited

function addTask() {
    if (inputBox.value=== '') {
        alert("You must write something");
        return;
    }

    if (editMode) {
        // If in edit mode, update the existing list item
        editMode.firstChild.textContent = inputBox.value;
        addBtn.innerHTML = "Add";
        addBtn.onclick = addTask; 
        editMode = null; 
    } else {
        let li = document.createElement("li");
        li.textContent = inputBox.value; 

        // Create Delete Button
        let span = document.createElement("span");
        span.innerHTML = "\u00d7"; 
        span.classList.add("delete");
        span.onclick = function () {
            li.remove();
            saveData();
        };

        // Create Edit Button
        let editBtn = document.createElement("button");
        editBtn.innerHTML = "&#9998;"; 
        editBtn.classList.add("edit");
        editBtn.onclick = function () {
            editTask(li);
        };

        // Append buttons to li
        li.appendChild(editBtn);
        li.appendChild(span);
        listContainer.appendChild(li);
    }

    inputBox.value = "";
    saveData();
}

// Function to Edit Task
function editTask(li) {
    inputBox.value = li.firstChild.textContent;
    inputBox.focus();
    addBtn.innerHTML = "Update"; 
    addBtn.onclick = function () {
        li.firstChild.textContent = inputBox.value; 
        inputBox.value = ""; 
        addBtn.innerHTML = "Add"; 
        addBtn.onclick = addTask; 
        editMode = null; 
        saveData();
    };
}

// Event listener for toggling tasks and deleting tasks
listContainer.addEventListener("click", function (e) {
    if (e.target.tagName === "LI") {
        e.target.classList.toggle("checked");
        saveData();
    }
});

// Search function
searchList.addEventListener("input", function () {
    const searchValue = searchList.value.toLowerCase();
    const items = listContainer.getElementsByTagName("li");

    for (let item of items) {
        if (item.textContent.toLowerCase().includes(searchValue)) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    }
});

// Save and Load Tasks
function saveData() {
    localStorage.setItem("data", listContainer.innerHTML);
}

function showTask() {
    listContainer.innerHTML = localStorage.getItem("data");

    // Reattach event listeners after loading from storage
    let spans = document.querySelectorAll(".delete");
    spans.forEach(span => {
        span.onclick = function () {
            span.parentElement.remove();
            saveData();
        };
    });

    let editButtons = document.querySelectorAll(".edit");
    editButtons.forEach(editBtn => {
        editBtn.onclick = function () {
            editTask(editBtn.parentElement);
        };
    });
}

showTask();