let story;
let charData = { name: "", age: 0, district: "", health: 100 };

async function start() {
  const storyContent = await fetch("story.json").then(r => r.json());
  story = new inkjs.Story(storyContent);

  // Force story to begin at the "intro" knot
  story.ChoosePathString("intro");

  // Bind external command function
  story.BindExternalFunction("bridge_prompt", () => {
    const cmd = prompt("Type an action (e.g. search water, hide, attack):");
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

document.getElementById("cmdInput").addEventListener("keypress", e => {
  if (e.key === "Enter") {
    const cmd = e.target.value.trim();
    const sponsorBox = document.getElementById("sponsor");

    sponsorBox.style.display = "block";

    if (cmd === "") {
      sponsorBox.innerText = "You didn't type anything.";
    } else if (/jump|run|hide|search|attack|talk|look|listen|drink|eat/.test(cmd)) {
      sponsorBox.innerText = `You tried: "${cmd}". Let's see what happens...`;
    } else {
      sponsorBox.innerText = `You tried: "${cmd}". Nothing happened... yet.`;
    }

    e.target.value = "";
  }
});

document.getElementById("hintBtn").onclick = () => {
  const sponsorBox = document.getElementById("sponsor");
  sponsorBox.style.display = "block";
  sponsorBox.innerText = "The AI whispers: Stay hidden near the riverbank and listen for movement.";
};

window.onload = start;
