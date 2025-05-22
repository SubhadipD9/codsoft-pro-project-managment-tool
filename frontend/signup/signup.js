const form = document.querySelector(".signup-form");

const API_URL = CONFIG.API_URL;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const name = document.getElementById("name").value;
  const username = document.getElementById("username").value;

  const errorSection = document.querySelector(".error-message");

  if (!email || !password || !name || !username) {
    errorSection.innerHTML = "Required fields are empty";
    return;
  }

  try {
    const response = await axios.post(
      `${API_URL}/api/user/signup`,
      {
        email,
        password,
        name,
        username,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const { data, status } = response;

    if (status === 201) {
      alert("Signup successfully");
      window.location.href = `../login/login.html`;
    }
  } catch (err) {
    if (err.response) {
      const res = err.response;
      const message =
        res.data?.message || res.data?.error || "An unexpected error occurred";

      errorSection.innerHTML = message;

      passwordInput.value = "";
    } else {
      alert("Some error happened: " + err.message);
      password.value = "";
    }
  }
});
