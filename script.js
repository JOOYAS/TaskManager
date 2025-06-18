let localData;
let tasks;
let lastId;
let taskForm = document.getElementById("taskForm");
let addTaskButton = document.getElementById("addTaskBtn");
let taskInput = document.getElementById("taskInput");
let taskList = document.getElementById("taskList");
let clearAllBtn = document.getElementById("clearAllBtn")

if (!localStorage.getItem("fetchedOnce")) {
        fetchTypicodeTodos().then(() => 
            localStorage.setItem("fetchedOnce", "true")
        );
}
    fetchLocal();
    // console.table(tasks); //just logs

    // filtering
    document.querySelectorAll('input[name="filter"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const selectedValue = document.querySelector('input[name="filter"]:checked').value;
            runFilter(selectedValue);
        });
    });
    

    tasks.reverse().forEach(task => { //reversing to list added task on top
        taskListItem(task)
    });

  
taskForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if(taskInput.value.trim() === ""){
        taskInput.value = null; // cleaering
        return;
    }
    addTaskToLocal();
    location.reload();

    taskInput.value = null; // clearing input field
});

clearAllBtn.addEventListener("click", () => {
    let result = confirm("Are you Sure...?");
    if (result) {
        localStorage.removeItem("tasks");
        localStorage.removeItem("lastUsedId")
        tasks = [];
        location.reload();
    }
})


// functions

function fetchLocal() {
    localData = localStorage.getItem("tasks");
    tasks = localData ? JSON.parse(localData) : []; 
    lastId = localStorage.getItem("lastUsedId");
}

function taskListItem(task) {

    const taskItem = document.createElement("li");
    taskItem.classList.add("taskItem");

    taskItem.innerHTML = `
		<span class="task-title">${task.title}</span>
		<div class="cmplt-dlt-container">
			<div class="complete-btn">✔</div>
			<button class="delete-btn">X</button>
		</div>
	`;

    const completeBtn = taskItem.querySelector(".complete-btn");
    const deleteBtn = taskItem.querySelector(".delete-btn");

    task.completed ? completeBtn.classList.add("completed") : ""
    completeBtn.addEventListener("click", () => {
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
}

function addTaskToLocal() {
    let task = {
        userId: "007",
        id: lastId ? Number(lastId) + 1 : 1,
        title: taskInput.value.trim(),
        completed: false
    };

    localStorage.setItem("tasks",JSON.stringify([
        ...(localData ? JSON.parse(localData) : []),
        task
    ]))
    localStorage.setItem("lastUsedId", task.id)
}

function updateLocal(taskId, update = "update") { //small changes can create editable tasks,with this function- todo-+++
    if (update === "remove") {
        tasks = tasks.filter(task => task.id !== taskId)
        localStorage.setItem("tasks", JSON.stringify(tasks.reverse())) //undoing the reversing
    } else
        localStorage.setItem("tasks", JSON.stringify(tasks.reverse())) //undoing the reverse
}

function runFilter(value) {
    if (value === "completed") {
        newTasks = tasks.filter(task => task.completed);
    } else if (value === "pending") {
        newTasks = tasks.filter( task => !task.completed);
    } else {
        newTasks = tasks;
    }

    taskList.innerHTML = ""
    newTasks.forEach(task => {
        taskListItem(task);
    });
}

async function fetchTypicodeTodos() { // using localhost, this api only loads one time in a browser
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
        tasks.forEach(task => taskListItem(task));
    } catch (err) {
        console.error("Failed to fetch from Typicode:", err);
    }
}
