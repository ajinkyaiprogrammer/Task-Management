# Task-Management

# TaskFlow — Task Management Board

TaskFlow is a lightweight task management board built with plain HTML, CSS, and JavaScript. It lets you create, edit, delete, and move tasks between `To Do`, `In Progress`, and `Completed` columns while preserving data across refreshes using localStorage.

## Features

- Add a new task with title, description, due date, and priority
- Edit existing tasks using the pencil icon
- Delete tasks using the trash icon
- Drag and drop tasks between columns
- Persist tasks in browser localStorage
- Priority selection for each task (Low, Medium, High)
- Clean board-style UI with sidebar and header controls

## Files

- `index.html` — application structure and board layout
- `style.css` — styling for the page, board, sidebar, cards, and form
- `script.js` — task logic, card creation, editing, drag-and-drop flow, and storage
- `assets/` — image assets used in the UI

## How it works

1. Open `index.html` in a browser.
2. Click the `+ New Task` button.
3. Enter the task title, description, select a due date, and choose a priority.
4. Submit the form to add the task to the `To Do` column.
5. Use the pencil icon to edit a task or the trash icon to delete it.
6. Drag a task card to another column to update its status.
7. All tasks are saved in localStorage and restore automatically after refresh.

## Notes

- The filter buttons and search input are present in the UI layout.
- The app currently stores data under the `taskflow_lists` key in localStorage.
- The form uses a simple custom priority selector implemented in `script.js`.
