const form = document.querySelector(".login-form");

const API_URL = CONFIG.API_URL;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorSection = document.querySelector(".error-message");

  try {
    const response = await axios.post(`${API_URL}/api/user/login`, {
      email,
      password,
    });
    const { data, status } = response;

    if (status === 200) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      alert("You are logged in");
      window.location.href = "../main/main.html";
    }
  } catch (err) {
    console.error("Sign-in error:", err);
    if (err.response && err.response.data) {
      errorSection.textContent =
        err.response.data.message || "Invalid credentials";
    } else {
      errorSection.textContent =
        "An unexpected error occurred. Please try again.";
    }
  }
});
