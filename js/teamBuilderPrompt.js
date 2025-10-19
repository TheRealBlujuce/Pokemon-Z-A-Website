// promptPokemonLoader.js
let promptResolve = null;

// Load the prompt HTML if not already in the DOM
export async function loadPrompt() {
  if (document.getElementById("custom-prompt")) return;

  try {
    const response = await fetch("../html/teamBuilderPrompt.html");
    const html = await response.text();
    document.body.insertAdjacentHTML("beforeend", html);
  } catch (err) {
    console.error("Failed to load prompt HTML:", err);
  }
}

// Show the prompt and return a promise for the input
export function promptPokemonName(message) {
  return new Promise((resolve) => {
    promptResolve = resolve;

    const overlay = document.getElementById("custom-prompt");
    const msgEl = document.getElementById("prompt-message");
    const input = document.getElementById("pokemon-input");
    const confirmBtn = document.getElementById("confirm-btn");
    const cancelBtn = document.getElementById("cancel-btn");

    if (!overlay || !input || !confirmBtn || !cancelBtn || !msgEl) {
      console.error("Prompt elements not loaded!");
      resolve(null);
      return;
    }

    msgEl.textContent = message;
    input.value = "";
    overlay.classList.remove("hidden");
    input.focus();

    const closePrompt = (value) => {
      overlay.classList.add("hidden");
      resolve(value);
    };

    confirmBtn.onclick = () => closePrompt(input.value.trim() || null);
    cancelBtn.onclick = () => closePrompt(null);

    input.onkeydown = (e) => {
      if (e.key === "Enter") confirmBtn.click();
    };
  });
}
