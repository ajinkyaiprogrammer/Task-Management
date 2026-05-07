//gets the elements from html page
const toDoCard       = document.getElementById("to-do-list");
const inProgressCard = document.getElementById("in-progress-list");
const completedCard  = document.getElementById("completed-list");

const submitButton  = document.getElementById("add-button");
const closeButton   = document.getElementById("close-button");
const newTaskButton = document.getElementById("btn");

const taskName        = document.getElementById("task-title");
const taskDescription = document.getElementById("task-description");
const taskDate = document.getElementById("inp-task-date");

//data
const toDoList       = [];
const inProgressList = [];
const completedList  = [];


//here we store the all data in key and value pair in data we have list of all cards and container is for where the data to be render
//lists is holding the all the three containers and when we render all the data no need to each time render seprate data simply
//we just iterate on this list gets all the data and then change on that
const lists = {
  todo:       { data: toDoList,       container: toDoCard       },
  inProgress: { data: inProgressList, container: inProgressCard },
  completed:  { data: completedList,  container: completedCard  },
};

let taskIdCounter = 0;

//priority selector
let selected_priority = 0;
const p_options = document.getElementById("p-option-div");
p_options.children[0].classList.add("selected");//using this selected applied the css to this inside css file

function select_priority(priority) {
  p_options.children[selected_priority].classList.remove("selected");//removing the css from selected button
  selected_priority = priority;
  p_options.children[selected_priority].classList.add("selected");//applied the ccs to the selected button by the user
}

//form open and form close
newTaskButton.addEventListener("click", openForm);
closeButton.addEventListener("click", closeForm);

newTaskButton.addEventListener("click", resetForm);

function openForm() {
  document.getElementById("task-form").style.display = "block";
}

function closeForm() {
  document.getElementById("task-form").style.display = "none";
  resetForm();
}



//for add task when hit submit button
submitButton.addEventListener("click", addCard);

//add card function to add card in todolist
function addCard() {
  const name = taskName.value.trim();//using trim to remove extra spaces
  const desc = taskDescription.value.trim();
  const date = taskDate.value;

  //alert box forced to fill all the elements
  if (!name || !desc || !date) {
    alert("Please fill all fields");
    return;
  }

  //when click on edit button so it edit the card details
  //already set the task id to null, if it have value then edit card if not then add card
  if (editingTaskId) {
    //findtask function return the task key if it find the task
    const result = findTask(editingTaskId);
    if (result) {
      result.task.name = name;
      result.task.desc = desc;
      result.task.date = date;
      result.task.priorityName = selected_priority;
    }
  } else {
    //create new task
    toDoList.push({
      //setting the id for each task so if needed to edit task of delete task we can use it
      id: `task-${taskIdCounter++}`,
      name,
      desc,
      priorityName: selected_priority,
      date,
    });
  }

  //to store the data after add or update
  saveToStorage();
  //these run for create and update
  //close form hide the form
  closeForm();
  //renderall render all the task
  renderAll();
}

//renderall
function renderAll() {
  for (const key in lists) {
    //get the key from lists and add the data of that in data and container
    const { data, container } = lists[key];
    //then empty all the data from the container
    container.innerHTML = "";
    //add all the data from data array to the container using append appenchild add the task
    data.forEach((item) => container.appendChild(buildCard(item)));
  }
}

//calling it from renderall function it takes each item from data array
function buildCard(task) {
  //creating div using createlement
  const card = document.createElement("div");
  //giving classname to the card, so simply apply css to it from css file
  card.className = "to-do-card";
  card.id = task.id;
  card.draggable = true;
  //add data into the div, calling getcardsetting
  card.innerHTML = getCardString(task);

  
  card.addEventListener("dragstart", handleDragStart);
  card.addEventListener("dragend",   handleDragEnd);
  card.addEventListener("click", handleCardClick);
  return card;
}

//getcardstring used for get the format of cards data 
//data-* is a html attribute use it for edit and delet access it by element.dataset.action
function getCardString(task) {
  return `
    <div>
      <label>${getPriority(task.priorityName)}</label>
      <i class="fa-solid fa-pencil" data-action="edit"></i>
      <i class="fa-solid fa-trash" data-action="delete"></i>
    </div>
    <div><h4>${task.name}</h4></div>
    <div><p>${task.desc}</p></div>
    <div class="card-date">
      <span><i class="fa-regular fa-calendar"></i> ${formatDate(task.date)}</span>
    </div>
  `;
}

//it is function to get the priority of the task
function getPriority(num) {
  return ["Low", "Medium", "High"][num] ?? "Low";
}


//drag & drop
function handleDragStart(e) {
  //this line tells the browser that thsi card is being moved not copied
  e.dataTransfer.effectAllowed = "move";
  //using this we save the id of card which is being moved
  e.dataTransfer.setData("text/plain", e.currentTarget.id);
  //this used to add css on dragging, we add the opacity on dragging, requestAnimationFrame is used to tell the browser
  requestAnimationFrame(() => e.currentTarget.classList.add("dragging"));
}

//this function runs when the drag end
function handleDragEnd(e) {
  //this line removes the faded effect we applly in dragstart function
  e.currentTarget.classList.remove("dragging");
  //this remove the colored border or background when the drag ends
  document
    .querySelectorAll(".drop-zone-active")
    .forEach((el) => el.classList.remove("drop-zone-active"));
}


function setupDropZones() {
  for (const key in lists) {
    //from lists we get the container
    const { container } = lists[key];

    //when the we drag any card this function gets called each time
    container.addEventListener("dragover", (e) => {
      e.preventDefault(); // required to allow a drop
      //this line tells the browser that thsi card is being moved not copied
      e.dataTransfer.dropEffect = "move";
      //this add the colored border or background when the drag starts
      container.classList.add("drop-zone-active");
    });

    //this is simple function when we leave the drag card then this function gets called
    container.addEventListener("dragleave", (e) => {
      // this function remove the colored border or background when the drag leave
      if (!container.contains(e.relatedTarget)) {
        container.classList.remove("drop-zone-active");
      }
    });

    //this function run
    container.addEventListener("drop", (e) => {
      e.preventDefault();
      //remove the colored border or background when the drag leave
      container.classList.remove("drop-zone-active");
      //read the id fo the card which is being moved
      const taskId = e.dataTransfer.getData("text/plain");
      //sent the id and the key of the card to the move function
      moveTask(taskId, key);
    });
  }
}

function moveTask(taskId, targetKey) {
  for (const key in lists) {
    const idx = lists[key].data.findIndex((t) => t.id === taskId);
    if (idx === -1) continue;
    //if the key and the targetkey is same then the card dropped in same column
    if (key === targetKey) return; // dropped in same column
    //we are storing the array return by the splice in the task
    //[task] is called array destructuring
    //const removed = lists[key].data.splice(idx, 1);
    //const task = removed[0]; //this and above line is same as the [task] but task is just more simplify structure
    const [task] = lists[key].data.splice(idx, 1);
    lists[targetKey].data.push(task);
    saveToStorage();
    renderAll();
    return;
  }
}

//for date convert in Dec 15, 2025
function formatDate(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

//for edit and delete the card this function call the edit and delete function
//calling this function  from buildcard function
function handleCardClick(e) {
  const action = e.target.dataset.action;
  if (!action) return;

  const cardEl = e.currentTarget;
  if (action === "delete") {
    deleteTask(cardEl.id);
  } else if (action === "edit") {
    openEditForm(cardEl.id);
  }

}

//delete the task
function deleteTask(taskId) {
  for (const key in lists) {
    const idx = lists[key].data.findIndex((t) => t.id === taskId);
    if (idx === -1) continue;
    lists[key].data.splice(idx, 1);//using splice method here we just go to that index and removes the one element

    //after delete the task save the data
    saveToStorage();
    renderAll();
    return;
  }
}

// editing the from
let editingTaskId = null;

//this function is for find the taskid of the task nad it return the task object and the key from the listkey
function findTask(taskId) {
  for (const key in lists) {
    const task = lists[key].data.find((t) => t.id === taskId);
    if (task) return { task, listKey: key };
  }
  return null;
}

//it will open the edit form whenhit the edit button
function openEditForm(taskId) {
  const result = findTask(taskId);
  if (!result) return;
  //const task = result.task this line and below line are same it just more simplified way to write
  // result is storing task and key from listkey we just get task from it
  const { task } = result;

  editingTaskId = taskId;
  taskName.value = task.name;
  taskDescription.value = task.desc;
  taskDate.value = task.date;
  select_priority(task.priorityName);

  // here we just change the title name in form
  document.querySelector(".card-title").textContent = "Edit Task Details";
  //change the submit button to update
  submitButton.textContent = "Update";

  openForm();
}

// reset the form by calling reset from from close from function
//when we edit or add the card then closeForm finction call from addCard function and it reset the data from form
function resetForm() {
  taskName.value = "";
  taskDescription.value = "";
  taskDate.value = "";
  select_priority(0);
  editingTaskId = null;
  document.querySelector(".card-title").textContent = "Enter Task Details";
  submitButton.textContent = "Submit";
} 

//here we storing the data in localstorage in device so tha data is visible after refresh
function saveToStorage() {
  //in taskflow-list we stored the data in string format, use localstorage.setitem to store the data
  localStorage.setItem("taskflow_lists", JSON.stringify({
    todo: toDoList,
    inProgress: inProgressList,
    completed: completedList,
  }));
}

//when we refresh or close app and reopen it the loadfromstorage function gets called and it get the all data
function loadFromStorage() {
  const saved = localStorage.getItem("taskflow_lists");
  if (!saved) return;
  //all the data we get in saved convert it in JSON object
  const data = JSON.parse(saved);
  //then push all the data into the list
  toDoList.push(...data.todo);
  inProgressList.push(...data.inProgress);
  completedList.push(...data.completed);
}

//calling this function at last when the all data is there in the lists and when evnts happen then it read the data and move the data
loadFromStorage();
renderAll();
setupDropZones();