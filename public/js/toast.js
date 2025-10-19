// Load the toast HTML into the document
export async function loadToast() {
    if (document.getElementById("custom-toast")) return; // Already loaded
  
    try {
      const response = await fetch("../html/toast.html");
      const html = await response.text();
      document.body.insertAdjacentHTML("beforeend", html);
    } catch (err) {
      console.error("Failed to load toast HTML:", err);
    }
  }
  
  // Show the toast with a message (and optional color type)
  export function showToast(message, type = "default") {
    const toast = document.getElementById("custom-toast");
    const toastMsg = document.getElementById("toast-message");
  
    if (!toast || !toastMsg) {
      console.error("Toast not loaded or missing elements!");
      return;
    }
  
    // Reset classes
    toast.className =
      "fixed top-64 left-1/2 -translate-x-1/2 px-5 py-3 rounded-lg shadow-lg text-center text-base transition-opacity duration-300 ease-in-out z-[9999] opacity-0";
  
    // Apply color scheme based on type
    const colors = {
      success: "bg-green-600 text-white",
      error: "bg-red-600 text-white",
      info: "bg-blue-600 text-white",
      default: "bg-gray-900 text-white",
    };
  
    toast.classList.add(...colors[type].split(" "));
  
    toastMsg.textContent = message;
    toast.classList.remove("opacity-0");
  
    // Auto-hide after 2.5s
    setTimeout(() => {
      toast.classList.add("opacity-0");
    }, 2500);
  }
  