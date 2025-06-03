let characters = [];
let availableCharacters = [];
let target;

async function loadCharacters() {
  try {
    const response = await fetch("character_List.json");
    if (!response.ok) throw new Error("Failed to load character data");

    const data = await response.json();

    // Flatten characters and add the inferred team name
    characters = Object.entries(data).flatMap(([team, members]) =>
      members.map(member => ({
        ...member,
        team: capitalize(team)
      }))
    );

    document.getElementById("input").disabled = false;
    newGame();
  } catch (error) {
    alert("Error loading characters: " + error.message);
  }
}

function newGame() {
  availableCharacters = [...characters];
  target = availableCharacters[Math.floor(Math.random() * availableCharacters.length)];
  document.getElementById("guesses").innerHTML = "";
  document.getElementById("replay").style.display = "none";
  document.getElementById("winModal").style.display = "none";
  document.getElementById("input").value = "";
}

const input = document.getElementById("input");
const suggestions = document.getElementById("suggestions");

input.addEventListener("input", () => {
  const val = input.value.toLowerCase();
  suggestions.innerHTML = "";
  if (!val) return;

  availableCharacters
    .filter((c) => c.name.toLowerCase().includes(val))
    .forEach((c) => {
      const li = document.createElement("li");
      li.className = "suggestion-item";
      
      // Create container
      const container = document.createElement("div");
      container.className = "suggestion-container";

      // Image
      const img = document.createElement("img");
      img.src = c.imageUrl + ".webp"; // or .jpg based on your files
      img.alt = c.name;
      img.className = "suggestion-image";

      // Name Text
      const span = document.createElement("span");
      span.textContent = c.name;

      container.appendChild(img);
      container.appendChild(span);
      li.appendChild(container);

      li.onclick = () => {
        addGuess(c);
        input.value = "";
        suggestions.innerHTML = "";
      };

      suggestions.appendChild(li);
    });
});


function addGuess(guess) {
  const row = document.createElement("div");
  row.className = "guess";

  // ⬅️ Character Image
  const imgContainer = document.createElement("div");
  imgContainer.className = "guess-image-wrapper";

  const img = document.createElement("img");
  img.src = guess.imageUrl + ".webp"; // adjust to .jpg/.webp if needed
  img.alt = guess.name;
  img.className = "guess-image";

  imgContainer.appendChild(img);
  row.appendChild(imgContainer);

  // 🔍 Attribute comparison
  const attrs = ["name", "gender", "team", "position", "occupation", "height_cm"];
  attrs.forEach((attr) => {
    const cell = document.createElement("div");
    const guessVal = guess[attr] ? String(guess[attr]) : "";
    const targetVal = target[attr] ? String(target[attr]) : "";

    if (guessVal === targetVal) {
      cell.className = "correct";
    } else if (targetVal.includes(guessVal) || guessVal.includes(targetVal)) {
      cell.className = "partial";
    } else {
      cell.className = "wrong";
    }

    if (attr === "height_cm") {
      let hint = "";
      const guessHeight = Number(guessVal);
      const targetHeight = Number(targetVal);
      if (!isNaN(guessHeight) && !isNaN(targetHeight)) {
        if (targetHeight > guessHeight) hint = " ↑ ";
        else if (targetHeight < guessHeight) hint = " ↓ ";
      }
      cell.textContent = guessVal + hint;
    } else {
      cell.textContent = guessVal;
    }

    row.appendChild(cell);
  });

  document.getElementById("guesses").appendChild(row);
  availableCharacters = availableCharacters.filter((c) => c.name !== guess.name);

  if (guess.name === target.name) {
    document.getElementById("replay").style.display = "inline-block";
    showVictoryModal(target);
  }
}

function showVictoryModal(character) {
  document.getElementById("winnerImage").src = character.imageUrl + ".webp"; // or .jpg
  document.getElementById("winnerName").textContent = character.name;
  document.getElementById("winModal").style.display = "flex";
}


function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

document.getElementById("replay").onclick = () => newGame();

loadCharacters();
