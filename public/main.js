let story;
let charData = { name: "", age: 0, district: "", health: 100 };

async function start() {
  const storyContent = await fetch("story.json").then(r => r.json());
  story = new inkjs.Story(storyContent);

  // Bind Ink function after story is ready
  story.BindExternalFunction("bridge_prompt", () => {
    const cmd = prompt("Type an action (e.g. search water, hide, attack, talk, rest):");
    return cmd ? cmd.toLowerCase() : "";
  });

  continueStory();
}

function continueStory() {
  const container = document.getElementById("storyContainer");
  const choicesEl = document.getElementById("choices");
  container.innerHTML = "";
  choicesEl.innerHTML = "";

  while (story.canContinue) {
    const p = document.createElement("p");
    p.innerText = story.Continue();
    container.appendChild(p);
  }

  story.currentChoices.forEach(choice => {
    const b = document.createElement("div");
    b.className = "choice";
    b.innerText = choice.text;
    b.onclick = () => {
      story.ChooseChoiceIndex(choice.index);
      continueStory();
    };
    choicesEl.appendChild(b);
  });

  updateStats();
}

function updateStats() {
  document.getElementById("charName").innerText = charData.name;
  document.getElementById("charDistrict").innerText = charData.district;
  document.getElementById("charAge").innerText = charData.age;
  document.getElementById("health").value = charData.health;
}

// Optional: Track command box (for now, just shows typed commands)
document.getElementById("cmdInput").addEventListener("keypress", e => {
  if (e.key === "Enter") {
    document.getElementById("sponsor").style.display = "block";
    document.getElementById("sponsor").innerText = `You tried: "${e.target.value}". Nothing happened... yet.`;
    e.target.value = "";
  }
});

document.getElementById("hintBtn").onclick = () => {
  document.getElementById("sponsor").style.display = "block";
  document.getElementById("sponsor").innerText = "The AI whispers: Stay hidden near the riverbank.";
};

window.onload = start;
