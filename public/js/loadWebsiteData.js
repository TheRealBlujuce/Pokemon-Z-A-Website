// load the toast html template. This can then be re-used anywhere
async function loadToast() {
    if (document.getElementById("custom-toast")) return; // already loaded
  
    try {
      const response = await fetch("../html/toast.html");
      const html = await response.text();
      document.body.insertAdjacentHTML("beforeend", html);
    } catch (err) {
      console.error("Failed to load toast HTML:", err);
    }
  }
  