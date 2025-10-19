import { getDatabase } from "./firebaseData.js";
import { typeColorMap } from "./colormap.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("pokemon-container");
  const searchBar = document.getElementById("search-bar");

  const db = getDatabase();
  const pokemonColRef = collection(db, "pokemon");

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  let pokemons = [];
  let filtered = [];
  let visibleCount = 0;
  const BATCH_SIZE = 12;
  let expandedCard = null;

  onSnapshot(
    pokemonColRef,
    (snapshot) => {
      pokemons = snapshot.docs.map((doc) => doc.data());
      pokemons.sort((a, b) => (a.pokedexNumber || 0) - (b.pokedexNumber || 0));
      filtered = [...pokemons];
      visibleCount = 0;
      container.innerHTML = "";
      renderNextBatch();
    },
    (error) => console.error("Error fetching Pokémon:", error)
  );

  searchBar.addEventListener("input", () => {
    const query = searchBar.value.toLowerCase();
    filtered = pokemons.filter((p) => p.name.toLowerCase().includes(query));
    visibleCount = 0;
    container.innerHTML = "";
    renderNextBatch();
  });

  function renderNextBatch() {
    const nextBatch = filtered.slice(visibleCount, visibleCount + BATCH_SIZE);

    nextBatch.forEach((p) => {
      const type = p.type1?.toLowerCase() || "normal";
      const colorClasses = typeColorMap[type] || "bg-black/10 hover:bg-gray-300/35";

      const card = document.createElement("div");
      card.className = `
        pokemon-card w-full rounded-xl shadow-lg p-4 text-black flex flex-col
        transition-all duration-300 ease-in-out hover:cursor-pointer hover:scale-[102%] ${colorClasses}
      `;

      card.innerHTML = `
        <div class="card-summary flex flex-row items-center gap-4">
          <img 
            data-src="${p.image}" 
            alt="${p.name}" 
            class="lazy-img w-24 h-24 object-contain opacity-0 transition-opacity duration-500"
          >
          <div class="flex flex-col gap-1">
            <h2 class="text-3xl font-bold">${"#" + p.pokedexNumber + " " + capitalize(p.name)}</h2>
            <p class="text-md font-bold">Type: ${p.type1}${p.type2 ? " / " + p.type2 : ""}</p>
            <p class="text-md font-bold">Location: ${p.location}</p>
              <div class="card-extra overflow-hidden max-h-0 transition-all duration-300 ease-in-out mt-2">
                <p class="text-md text-gray-800 font-bold">Mega Evolution: ${p.canMega ? "Yes" : "No"}</p>
                <p class="text-md text-gray-800 font-bold">Can Be Alpha: ${p.canAlpha ? "Yes" : "No"}</p>
              </div>
          </div>
        </div>

        
      `;

      // Expand/collapse with smooth card height
      card.addEventListener("click", () => {
        const extra = card.querySelector(".card-extra");

        if (expandedCard && expandedCard !== card) {
          // collapse previous
          const prevExtra = expandedCard.querySelector(".card-extra");
          prevExtra.style.maxHeight = "0";
          expandedCard.classList.remove("scale-[105%]");
        }

        if (extra.style.maxHeight && extra.style.maxHeight !== "0px") {
          extra.style.maxHeight = "0";
          card.classList.remove("scale-[105%]");
          expandedCard = null;
        } else {
          extra.style.maxHeight = extra.scrollHeight + "px";
          card.classList.add("scale-[105%]");
          expandedCard = card;
        }
      });

      container.appendChild(card);
    });

    lazyLoadImages();
    visibleCount += nextBatch.length;

    if (visibleCount < filtered.length) {
      setupScrollObserver();
    }
  }

  function lazyLoadImages() {
    const lazyImages = document.querySelectorAll(".lazy-img[data-src]");
    const imgObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.onload = () => img.classList.add("opacity-100");
          observer.unobserve(img);
        }
      });
    });
    lazyImages.forEach((img) => imgObserver.observe(img));
  }

  function setupScrollObserver() {
    const sentinel = document.createElement("div");
    sentinel.classList.add("sentinel");
    container.appendChild(sentinel);

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        sentinel.remove();
        renderNextBatch();
      }
    });
    observer.observe(sentinel);
  }
});
