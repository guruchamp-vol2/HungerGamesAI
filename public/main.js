let story;
let charData = { name: "", age: 0, district: "", health: 100, weapon: "", inventory: "" };

async function start() {
  const storyContent = await fetch("story.json").then(r => r.json());
  story = new inkjs.Story(storyContent);

  // Start at the intro knot
  story.ChoosePathString("intro");

  // Bind external function for command input
  story.BindExternalFunction("bridge_prompt", (promptText) => {
    const userInput = prompt(promptText || "Enter your response:");
    return userInput ? userInput : "";
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

// GPT-powered free roam handler
async function handleFreeRoamAction(action) {
  try {
    // Update character data from story variables
    charData.name = story.variablesState["name"] || "";
    charData.district = story.variablesState["district"] || "";
    charData.age = story.variablesState["age"] || 0;
    charData.health = story.variablesState["health"] || 100;
    charData.weapon = story.variablesState["weapon"] || "";
    charData.inventory = story.variablesState["inventory"] || "";
    charData.trainingScore = story.variablesState["training_score"] || 0;
    charData.sponsorPoints = story.variablesState["sponsor_points"] || 0;

    const storyContext = "You are in the Hunger Games arena. The Games have begun and you must survive. Other tributes are hunting, and the arena is full of dangers and opportunities.";

    const response = await fetch('/api/free-roam', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: action,
        playerStats: charData,
        storyContext: storyContext
      })
    });

    const data = await response.json();
    
    // Set the GPT response in the story
    story.variablesState["gpt_response"] = data.response;
    
    // Continue the story
    continueStory();
  } catch (error) {
    console.error('Error calling GPT API:', error);
    story.variablesState["gpt_response"] = "You try the action, but something unexpected happens. The arena is full of surprises.";
    continueStory();
  }
}

document.getElementById("cmdInput").addEventListener("keypress", e => {
  if (e.key === "Enter") {
    const cmd = e.target.value.trim().toLowerCase();
    if (cmd) {
      story.variablesState["action"] = cmd;
      
      // Check if it's a predefined action or needs GPT
      const predefinedActions = ["search water", "hide", "attack", "eat", "run to the woods"];
      if (predefinedActions.includes(cmd)) {
        // Use predefined response
        continueStory();
      } else {
        // Use GPT for unknown actions
        handleFreeRoamAction(cmd);
      }
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
