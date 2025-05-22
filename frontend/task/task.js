const taskAddForm = document.getElementById("add-task-form");

const token = localStorage.getItem("token");

const API_KEY = CONFIG.API_URL;

if (!token) {
  alert("Please relogin");
  window.location.href = `../login/login.html`;
}

const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get("id");

if (taskAddForm) {
  taskAddForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const taskTitle = document.getElementById("task-title").value;
    const taskStatus = document
      .getElementById("task-status")
      .value.toLowerCase();
    const assigned = document.getElementById("assigned-to").value;
    const time = document.getElementById("task-time").value;

    try {
      const response = await axios.post(
        `${API_KEY}/api/task/create-task/${projectId}`,
        {
          title: taskTitle,
          status: taskStatus,
          assignedTo: assigned,
          time: time,
        },
        {
          headers: { authorization: token },
        }
      );

      const { data, status } = response;

      if (status === 201) {
        alert("The task successfully add to this project");
        window.location.href = `../main/main.html`;
      }
    } catch (err) {
      if (err.response.status === 409) {
        alert("this task is already exist");
        window.location.href = `../main/main.html`;
      }
      if (err.response.status === 500) {
        alert("Something went wrong while creating the task");
      }
    }
  });
} else {
  console.error("Form with ID 'add-task-form' not found.");
}
