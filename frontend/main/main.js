const displayContent = document.querySelector(".project-list");
const displayError = document.querySelector(".show-error");

const API_URL = CONFIG.API_URL;
const token = localStorage.getItem("token");

if (!token) {
  alert("Your session has expired.");
  window.location.href = `../login/login.html`;
} else {
  showProjects();
}

async function showProjects() {
  try {
    const response = await axios.get(`${API_URL}/api/project/projects`, {
      headers: { authorization: token },
    });

    const projects = response.data.projects;

    projects.forEach((data) => {
      const projectContainer = document.createElement("div");
      projectContainer.classList.add("project-card");

      const titleEl = document.createElement("a");
      titleEl.href = `../task/task.html?id=${data._id}`;
      titleEl.textContent = data.title;

      const authorEl = document.createElement("p");
      authorEl.textContent = `By: ${data.owner}`;
      authorEl.classList.add("project-author");

      const contentEl = document.createElement("div");
      const cleanHTML = DOMPurify.sanitize(data.description);
      contentEl.innerText = cleanHTML;
      contentEl.classList.add("project-description");

      const buttonGroup = document.createElement("div");
      buttonGroup.classList.add("button-group");

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.classList.add("btn", "btn-primary");
      editBtn.addEventListener("click", () => {
        window.location.href = `edit.html?slug=${data.slug}`;
      });

      const addTask = document.createElement("button");
      addTask.textContent = "Assign Task";
      addTask.classList.add("btn", "btn-secondary");
      addTask.addEventListener("click", () => {
        window.location.href = `../task/addTask.html?id=${data._id}`;
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.classList.add("btn", "btn-danger");
      deleteBtn.addEventListener("click", () =>
        deleteProject(data._id, projectContainer)
      );

      buttonGroup.append(editBtn, addTask, deleteBtn);
      projectContainer.append(titleEl, authorEl, contentEl, buttonGroup);
      displayContent.appendChild(projectContainer);
    });
  } catch (err) {
    console.error("Error fetching projects", err);

    if (err.response.status === 404) {
      displayError.textContent = "You don't have any project, Create one now";
      displayError.style.color = "red";
    }

    if (err.response && err.response.status === 403) {
      alert("Session expired. Please sign in again.");
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      window.location.href = "../login/login.html";
    }
  }
}

async function deleteProject(id, element) {
  try {
    const response = await axios.delete(
      `${API_URL}/api/project/delete-project/${id}`,
      {
        headers: { authorization: token },
      }
    );

    if (response.status === 200) {
      alert("Project deleted successfully");

      element.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      element.style.opacity = "0";
      element.style.transform = "translateY(-10px)";
      setTimeout(() => {
        element.remove();
      }, 300);
    }
  } catch (err) {
    alert("Failed to delete project: " + err.message);
  }
}
