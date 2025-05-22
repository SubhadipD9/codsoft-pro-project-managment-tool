const form = document.querySelector(".project-form");

const API_URL = CONFIG.API_URL;

const token = localStorage.getItem("token");

if (!token) {
  alert("Please re-login");
  window.location.href = `../login/login.html`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;

  try {
    const response = await axios.post(
      `${API_URL}/api/project/create-project`,
      {
        title,
        description,
      },
      {
        headers: { authorization: token },
      }
    );

    const { data, status } = response;

    if (status === 201) {
      alert("Project creted successfully");
      window.location.href = `../main/main.html`;
    }
  } catch (err) {
    console.error(err);
    if (err.response.status === 409) {
      alert("You have already create this project");
    }
  }
});
