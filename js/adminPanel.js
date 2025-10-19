import { getAllPokemon, login, logout, getCurrentUser, getDatabase, auth } from "./firebaseData.js";
import { doc, setDoc, getDoc, deleteDoc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
    const mainSection = document.querySelector("main");
    if (!mainSection) return console.error("No <main> found in the document.");

    const db = getDatabase();
    const toggleBtn = document.getElementById("admin-btn");
    const adminEmail = "willmarda@icloud.com";

    toggleBtn.style.display = "none"; // hide by default
    toggleBtn.classList.add("hidden"); // hide by default

    let adminPanelInjected = false;
    let adminPanel;

    // --- Listen for auth state changes ---
    auth.onAuthStateChanged(async (user) => {
        if (user && user.email === adminEmail) {
            toggleBtn.style.display = "flex";
            toggleBtn.classList.remove("hidden"); // hide by default
            if (!adminPanelInjected) {
                try {
                    const response = await fetch("../html/adminPanel.html");
                    if (!response.ok) throw new Error("Failed to load adminPanel.html");
                    const html = await response.text();
                    mainSection.insertAdjacentHTML("beforebegin", html);

                    adminPanel = document.getElementById("admin-panel");
                    if (!adminPanel) return console.error("Admin panel not found.");
                    adminPanelInjected = true;
                    adminPanel.classList.add("hidden");

                    // Toggle admin panel
                    toggleBtn.addEventListener("click", () => {
                        adminPanel.classList.toggle("hidden");
                    });

                    setupAdminPanel();

                } catch (err) {
                    console.error("Error loading admin panel:", err);
                }
            }

        } else {
            toggleBtn.style.display = "none";
            toggleBtn.classList.add("hidden"); // hide by default
            if (adminPanelInjected && adminPanel) {
                adminPanel.classList.add("hidden");
            }
        }
    });

    function setupAdminPanel() {
        const dataTypeSelect = document.getElementById("data-type");
        const pokemonFields = document.getElementById("pokemon-fields");
        const moveFields = document.getElementById("move-fields");
        const dataForm = document.getElementById("data-form");
        const searchInput = document.getElementById("search-id");
        const searchBtn = document.getElementById("search-btn");
        const resultContainer = document.getElementById("result-container");

        function updateFieldRequirements() {
            if (dataTypeSelect.value === "pokemon") {
                pokemonFields.querySelectorAll("input").forEach(i => i.required = i.id !== "pokemon-type2");
                moveFields.querySelectorAll("input").forEach(i => i.required = false);
            } else {
                moveFields.querySelectorAll("input").forEach(i => i.required = true);
                pokemonFields.querySelectorAll("input").forEach(i => i.required = false);
            }
        }

        updateFieldRequirements();
        dataTypeSelect.addEventListener("change", updateFieldRequirements);

        // Add / Update
        dataForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const currentUser = getCurrentUser();
            if (!currentUser || currentUser.email !== adminEmail) return alert("You must be logged in as admin!");
            const type = dataTypeSelect.value;
        
            try {
                if (type === "pokemon") {
                    const name = document.getElementById("pokemon-name").value.trim();
                    const url = document.getElementById("pokemon-url").value.trim();
                    const type1 = document.getElementById("pokemon-type1").value.trim();
                    const type2 = document.getElementById("pokemon-type2").value.trim();
                    const location = document.getElementById("pokemon-location").value.trim();
                    const pokedexNumber = parseInt(document.getElementById("pokedex-number").value);
        
                    // NEW FIELDS
                    const canMega = document.getElementById("pokemon-mega").value === "yes";
                    const canAlpha = document.getElementById("pokemon-alpha").value === "yes";                    
        
                    await setDoc(doc(db, "pokemon", name.toLowerCase()), { 
                        name, 
                        image: url, 
                        type1, 
                        type2: type2 || null, 
                        location, 
                        pokedexNumber: pokedexNumber,
                        canMega,
                        canAlpha
                    });
        
                    dataForm.reset();
                } else if (type === "move") {
                    const name = document.getElementById("move-name").value.trim();
                    const moveType = document.getElementById("move-type").value.trim();
                    const cooldown = parseInt(document.getElementById("move-cooldown").value);
        
                    await setDoc(doc(db, "moves", name.toLowerCase()), { name, type: moveType, cooldown });
                    dataForm.reset();
                }
            } catch (err) {
                console.error(err);
                alert("Failed to add/update data.");
            }
        });

        // Search / Update / Delete
        searchBtn.addEventListener("click", async () => {
            resultContainer.innerHTML = "";
            const query = searchInput.value.trim().toLowerCase();
            if (!query) return alert("Enter a name or ID");

            const collectionName = dataTypeSelect.value;
            const docRef = doc(db, collectionName, query);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                resultContainer.innerHTML = `<p class="text-red-500">No ${collectionName} found with that name/ID</p>`;
                return;
            }

            const data = docSnap.data();
            const resultHTML = document.createElement("div");
            resultHTML.className = "p-4 bg-slate-700 rounded shadow";

            let fieldsHTML = "";
            if (collectionName === "pokemon") {
                fieldsHTML = `
                    <p class="text-white"><strong>Name:</strong> ${data.name}</p>
                    <p class="text-white"><strong>Type1:</strong> ${data.type1}</p>
                    <p class="text-white"><strong>Type2:</strong> ${data.type2 || "N/A"}</p>
                    <p class="text-white"><strong>Location:</strong> ${data.location}</p>
                    <p class="text-white"><strong>Pokedex #:</strong> ${data.pokedexNumber || "N/A"}</p>
                    <p class="text-white"><strong>Image URL:</strong> <a href="${data.image}" target="_blank" class="text-blue-300 underline">Link</a></p>
                    <p class="text-white"><strong>Can Mega Evolve:</strong> ${data.canMega === true ? "✅ Yes" : "❌ No"}</p>
                    <p class="text-white"><strong>Can Be Alpha:</strong> ${data.canAlpha === true ? "✅ Yes" : "❌ No"}</p>
                `;
            } else {
                fieldsHTML = `
                    <p class="text-white"><strong>Name:</strong> ${data.name}</p>
                    <p class="text-white"><strong>Type:</strong> ${data.type}</p>
                    <p class="text-white"><strong>Cooldown:</strong> ${data.cooldown}</p>
                `;
            }
            

            resultHTML.innerHTML = `
                ${fieldsHTML}
                <div class="mt-2 flex gap-2">
                    <button class="update-btn bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Update</button>
                    <button class="delete-btn bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
                </div>
            `;

            resultContainer.appendChild(resultHTML);

            // Use class selectors to avoid duplicate ID issues
            const deleteBtn = resultHTML.querySelector(".delete-btn");
            const updateBtn = resultHTML.querySelector(".update-btn");

            deleteBtn.addEventListener("click", async () => {
                if (confirm("Are you sure you want to delete this item?")) {
                    await deleteDoc(docRef);
                    alert(`${collectionName} deleted successfully`);
                    resultContainer.innerHTML = "";
                }
            });

            // --- Update Button ---
            updateBtn.addEventListener("click", () => {
                if (collectionName === "pokemon") {
                    document.getElementById("pokemon-name").value = data.name;
                    document.getElementById("pokemon-url").value = data.image;
                    document.getElementById("pokemon-type1").value = data.type1;
                    document.getElementById("pokemon-type2").value = data.type2 || "";
                    document.getElementById("pokemon-location").value = data.location;
                    document.getElementById("pokedex-number").value = data.pokedexNumber || "";

                    // NEW FIELDS
                    document.getElementById("pokemon-mega").value = data.canMega ? "yes" : "no";
                    document.getElementById("pokemon-alpha").value = data.canAlpha ? "yes" : "no";                    

                    dataTypeSelect.value = "pokemon";
                    pokemonFields.classList.remove("hidden");
                    moveFields.classList.add("hidden");
                } else {
                    document.getElementById("move-name").value = data.name;
                    document.getElementById("move-type").value = data.type;
                    document.getElementById("move-cooldown").value = data.cooldown;
                    dataTypeSelect.value = "move";
                    moveFields.classList.remove("hidden");
                    pokemonFields.classList.add("hidden");
                }
            });
        });
    }
});
