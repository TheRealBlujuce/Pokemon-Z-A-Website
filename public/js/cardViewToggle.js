const pokemonBtn = document.querySelector('a[href=""]:nth-of-type(1)');
const movesBtn = document.querySelector('a[href=""]:nth-of-type(2)');
const pokemonContainer = document.getElementById('pokemon-container');
const movesContainer = document.getElementById('moves-container');

pokemonBtn.addEventListener('click', (e) => {
    e.preventDefault(); // prevent default link behavior
    pokemonContainer.classList.remove('hidden');
    movesContainer.classList.add('hidden');
});

movesBtn.addEventListener('click', (e) => {
    e.preventDefault();
    movesContainer.classList.remove('hidden');
    pokemonContainer.classList.add('hidden');
});
