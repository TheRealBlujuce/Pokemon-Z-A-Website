import { getDatabase } from "./firebaseData.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { loadToast, showToast } from "./toast.js";
import { loadPrompt, promptPokemonName } from "./teamBuilderPrompt.js";
await loadToast(); // Load toast once at page init
await loadPrompt(); // Load HTML once at page init

async function loadTeamBuilder() {
  try {
    const response = await fetch("../html/teamBuilderPanel.html");
    const html = await response.text();

    const pokemonContainer = document.getElementById("pokemon-container");

    if (pokemonContainer && !document.getElementById("team-builder")) {
      pokemonContainer.insertAdjacentHTML("beforebegin", html);
      await initializeTeamBuilder(); // ensure DB fetch finishes
    }
  } catch (error) {
    console.error("Error loading Team Builder:", error);
  }
}

let team = Array(6).fill(null); // Track Pokémon in each slot
let pokemonList = []; // Holds all Pokémon from Firestore

async function initializeTeamBuilder() {
  const db = getDatabase();
  const pokemonCol = collection(db, "pokemon");

  // Get all Pokémon once from Firestore
  try {
    const snapshot = await getDocs(pokemonCol);
    pokemonList = snapshot.docs.map((doc) => doc.data());
    console.log("Loaded Pokémon:", pokemonList.length);
  } catch (err) {
    console.error("Failed to fetch Pokémon:", err);
  }

  const slots = document.querySelectorAll(".team-slot");
  const saveBtn = document.getElementById("save-team-btn");
  const clearBtn = document.getElementById("clear-team-btn");

  // Hover effect
  slots.forEach((slot) => {
    slot.addEventListener("mouseenter", () => slot.classList.add("scale-105"));
    slot.addEventListener("mouseleave", () => slot.classList.remove("scale-105"));
  });

  // Add Pokémon when clicking a slot
  slots.forEach((slot) => {
    slot.addEventListener("click", async () => {
        const name = await promptPokemonName("Enter the Pokémon's name:");
        if (!name) return;
      
        const pokemon = pokemonList.find(
          (p) => p.name.toLowerCase() === name.toLowerCase()
        );
      
        if (!pokemon) {
          showToast("Pokémon not found or not part of the Z-A Pokédex!", "error");
          return;
        }
      
        const index = parseInt(slot.dataset.slot, 10) - 1;
        team[index] = { name: pokemon.name, image: pokemon.image };
      
        const img = slot.querySelector("img");
        const label = slot.querySelector("p");
        
        showToast(pokemon.name + " was added to the team!", "success");

        img.src =
          pokemon.image ||
          "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";
        img.classList.remove("opacity-60");
        label.textContent = pokemon.name;
        label.classList.remove("text-white/75");
      });      
  });

  // Save team
  saveBtn.addEventListener("click", () => {
    localStorage.setItem("pokemonTeam", JSON.stringify(team));
    alert("Team saved!");
  });

  // Clear team
  clearBtn.addEventListener("click", () => {
    team = Array(6).fill(null);
    slots.forEach((slot) => {
      const img = slot.querySelector("img");
      const label = slot.querySelector("p");

      img.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";
      img.classList.add("opacity-60");
      label.textContent = "Add Pokémon";
      label.classList.add("text-white/75");
    });
    localStorage.removeItem("pokemonTeam");
  });

  // Load saved team from localStorage
  const savedTeam = JSON.parse(localStorage.getItem("pokemonTeam") || "[]");
  if (savedTeam.length) {
    savedTeam.forEach((pokemon, i) => {
      if (pokemon) {
        team[i] = pokemon;
        const slot = slots[i];
        const img = slot.querySelector("img");
        const label = slot.querySelector("p");

        img.src = pokemon.image;
        img.classList.remove("opacity-60");
        label.textContent = pokemon.name;
        label.classList.remove("text-white/75");
      }
    });
  }
}

// Run on load
loadTeamBuilder();
