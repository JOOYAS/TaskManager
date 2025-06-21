let localData;
let tasks; //stored as reversed, and later filtered
let fTasks;
let lastId;
let taskForm = document.getElementById("taskForm");
let addTaskButton = document.getElementById("addTaskBtn");
let taskInput = document.getElementById("taskInput");
let taskList = document.getElementById("taskList");
let clearAllBtn = document.getElementById("clearAllBtn")

if (!localStorage.getItem("fetchedOnce")) {  // dummy api runs once
        fetchTypicodeTodos().then(() => 
            localStorage.setItem("fetchedOnce", "true")
        );
}

taskListItems();

document.querySelectorAll('input[name="filter"]').forEach(radio => {
    radio.addEventListener('change', () => taskListItems())
})

taskForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if(taskInput.value.trim() === ""){
        taskInput.value = null; // cleaering
        return;
    }
    addTaskToLocal();
    taskInput.value = null; // clearing input field
});

clearAllBtn.addEventListener("click", () => {
    let result = confirm("Are you Sure...?");
    if (result) {
        localStorage.removeItem("tasks");
        localStorage.removeItem("lastUsedId");
        localData = {}
        tasks = [];
        fTasks = [];
        taskList.innerHTML = "";

        taskListItems();
    }
})


// functions

function fetchLocal() {
    localData = localStorage.getItem("tasks"); //unparsed JSON data
    tasks = localData ? JSON.parse(localData).reverse() : []; 
    lastId = localStorage.getItem("lastUsedId");

    selectedValue = document.querySelector('input[name="filter"]:checked').value;
    fTasks = runFilter(selectedValue);
    // console.log('selectedValue = ', selectedValue);
    // console.log("localdata json = ", localData);
    // console.log('tasks = ', tasks);
    // console.log('fTasks = ', fTasks);
}

function taskListItems() {
    fetchLocal()
    taskList.innerHTML = "";
    fTasks.forEach(task => {
        const taskItem = document.createElement("li");
        taskItem.classList.add("taskItem");

        taskItem.innerHTML = `
            <div class="check-text-container">
                <div class="complete-btn">✔</div>
                <p class="task-title">${task.title}</p>
            </div>
            
            <button class="delete-btn">✖</button>
        `;

        const completeBtn = taskItem.querySelector(".complete-btn");
        const deleteBtn = taskItem.querySelector(".delete-btn");

        task.completed ? completeBtn.classList.add("completed") : ""
        taskItem.addEventListener("click", () => {
            task.completed = !task.completed;
            updateLocal(task);
            console.table(tasks);
            completeBtn.classList.toggle("completed");
        });

        deleteBtn.addEventListener("click", () => {
            updateLocal(task.id, "remove");
            taskItem.remove();
        });

        taskList.appendChild(taskItem);
    })
    if (taskList.innerHTML === "") taskList.style.display = "none";
    else taskList.style.display = "block";
}

function addTaskToLocal() {
    fetchLocal();
    let task = {
        userId: "007",
        id: lastId ? Number(lastId) + 1 : 1,
        title: taskInput.value.trim(),
        completed: false
    };

    localStorage.setItem("tasks",JSON.stringify([
        ...(JSON.parse(localStorage.getItem("tasks") || "[]")),
        task
    ]))
    localStorage.setItem("lastUsedId", task.id);
    document.getElementById("radioBtnAll").checked = true;

    taskListItems()
}

function updateLocal(taskId, update = "update") { //small changes can create editable tasks,with this function. 
    if (update === "remove") {
        tasks = tasks.filter(task => task.id !== taskId) 
        localStorage.setItem("tasks", JSON.stringify([...tasks].reverse())); //its unrever
    } else {
        localStorage.setItem("tasks", JSON.stringify([...tasks].reverse()));
    }

    // taskListItems()   //if used this , completed tasks get removed from pending instatly, and vice versa
    //currently it will stay until refresh/filter-change
}

function runFilter(selectedValue) {
    let newTasks = tasks; //just for safety, if any chance to not change tasks accidently
    let filteredTask;
    if (selectedValue === "completed") {
        filteredTask = newTasks.filter(task => task.completed);
    } else if (selectedValue === "pending") {
        filteredTask = newTasks.filter(task => !task.completed);
    } else {
        filteredTask = newTasks;
    }

    return filteredTask;
}

async function fetchTypicodeTodos() { // this api funtion only loads one time in a browser
    try {
        const res = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=10");
        const data = await res.json();

        const converted = data.map(todo => ({
            id: todo.id,
            title: todo.title,
            completed: todo.completed,
        })).reverse();

        tasks = converted;
        localStorage.setItem("tasks", JSON.stringify(tasks));
        taskListItems(tasks);
    } catch (err) {
        console.error("Failed to fetch from Typicode:", err);
    }
}
