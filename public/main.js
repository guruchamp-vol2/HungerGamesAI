// Character data object
const charData = {
    name: "",
    district: "",
    age: 0,
    health: 100,
    weapon: "",
    inventory: "",
    trainingScore: 0,
    sponsorPoints: 0
};

// Initialize the story
let story;
let currentChoices = [];

// Load the story when the page loads
window.addEventListener('load', async () => {
    try {
        const response = await fetch('story.json');
        const storyContent = await response.json();
        
        story = new inkjs.Story(storyContent);
        
        // Start the story
        continueStory();
        
        // Set up input handlers
        setupInputHandlers();
        
    } catch (error) {
        console.error('Error loading story:', error);
        document.getElementById('storyContainer').innerHTML = '<p style="color: #ff6b6b;">Error loading story. Please refresh the page.</p>';
    }
});

// Set up input handlers
function setupInputHandlers() {
    const cmdInput = document.getElementById('cmdInput');
    const hintBtn = document.getElementById('hintBtn');
    
    // Handle Enter key in input
    cmdInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const action = cmdInput.value.trim();
            if (action) {
                handleFreeRoamAction(action);
                cmdInput.value = '';
            }
        }
    });
    
    // Handle hint button
    hintBtn.addEventListener('click', () => {
        showHint();
    });
}

// Continue the story
function continueStory() {
    // Get the current story text
    let storyText = '';
    while (story.canContinue) {
        storyText += story.Continue();
    }
    
    // Display the story text with fade-in animation
    if (storyText.trim()) {
        const storyContainer = document.getElementById('storyContainer');
        const newText = document.createElement('p');
        newText.className = 'fade-in';
        newText.textContent = storyText;
        storyContainer.appendChild(newText);
        storyContainer.scrollTop = storyContainer.scrollHeight;
    }
    
    // Display choices if available
    displayChoices();
    
    // Update character stats
    updateCharacterStats();
}

// Display choices
function displayChoices() {
    const choicesContainer = document.getElementById('choices');
    choicesContainer.innerHTML = '';
    
    if (story.currentChoices.length > 0) {
        currentChoices = story.currentChoices;
        
        story.currentChoices.forEach((choice, index) => {
            const choiceElement = document.createElement('div');
            choiceElement.className = 'choice fade-in';
            choiceElement.textContent = choice.text;
            choiceElement.addEventListener('click', () => {
                // Add click animation
                choiceElement.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    choiceElement.style.transform = '';
                }, 150);
                
                // Handle custom name input
                if (choice.text === 'Enter your name') {
                    handleNameInput();
                } else {
                    // Make the choice
                    story.ChooseChoiceIndex(index);
                    continueStory();
                }
            });
            choicesContainer.appendChild(choiceElement);
        });
    } else {
        // No choices means we're in free roam mode
        showFreeRoamMode();
    }
}

// Handle custom name input
function handleNameInput() {
    const name = prompt('Enter your tribute name:');
    if (name && name.trim()) {
        story.variablesState["name"] = name.trim();
        // Continue to age selection
        continueStory();
    } else {
        // If no name entered, use default
        story.variablesState["name"] = "Tribute";
        continueStory();
    }
}

// Show free roam mode
function showFreeRoamMode() {
    const inputSection = document.querySelector('.input-section');
    inputSection.style.display = 'block';
    
    // Focus on input
    setTimeout(() => {
        document.getElementById('cmdInput').focus();
    }, 100);
}

// Handle free roam actions
async function handleFreeRoamAction(action) {
    const typingIndicator = document.getElementById('typingIndicator');
    const storyContainer = document.getElementById('storyContainer');
    
    // Show typing indicator
    typingIndicator.style.display = 'block';
    
    // Add user action to story
    const userActionText = document.createElement('p');
    userActionText.className = 'fade-in';
    userActionText.style.color = '#ffd93d';
    userActionText.style.fontStyle = 'italic';
    userActionText.textContent = `> ${action}`;
    storyContainer.appendChild(userActionText);
    storyContainer.scrollTop = storyContainer.scrollHeight;
    
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

        const storyContext = "You are in the Hunger Games arena. The Games have begun and you must survive. Other tributes are hunting you, and you need to find food, water, and shelter while avoiding danger.";

        // Send action to server for GPT processing
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

        if (response.ok) {
            const data = await response.json();
            
            // Set the GPT response in the story
            story.variablesState["gpt_response"] = data.response;
            
            // Continue the story to process the action
            continueStory();
            
            // Update character stats after action
            updateCharacterStats();
            
        } else {
            throw new Error('Failed to get AI response');
        }
        
    } catch (error) {
        console.error('Error processing action:', error);
        
        // Fallback response
        const fallbackText = document.createElement('p');
        fallbackText.className = 'fade-in';
        fallbackText.style.color = '#ff6b6b';
        fallbackText.textContent = "You attempt the action, but something goes wrong. Try again.";
        storyContainer.appendChild(fallbackText);
    } finally {
        // Hide typing indicator
        typingIndicator.style.display = 'none';
        storyContainer.scrollTop = storyContainer.scrollHeight;
    }
}

// Update character stats display
function updateCharacterStats() {
    // Update basic stats
    document.getElementById('charName').textContent = story.variablesState["name"] || "-";
    document.getElementById('charDistrict').textContent = story.variablesState["district"] || "-";
    document.getElementById('charAge').textContent = story.variablesState["age"] || "-";
    document.getElementById('charWeapon').textContent = story.variablesState["weapon"] || "-";
    document.getElementById('charInventory').textContent = story.variablesState["inventory"] || "-";
    
    // Update health bar with animation
    const health = story.variablesState["health"] || 100;
    const healthBar = document.getElementById('health');
    const currentWidth = parseInt(healthBar.style.width) || 100;
    const targetWidth = health;
    
    // Animate health bar change
    if (currentWidth !== targetWidth) {
        animateHealthBar(currentWidth, targetWidth);
    }
    
    // Update character data object
    charData.name = story.variablesState["name"] || "";
    charData.district = story.variablesState["district"] || "";
    charData.age = story.variablesState["age"] || 0;
    charData.health = health;
    charData.weapon = story.variablesState["weapon"] || "";
    charData.inventory = story.variablesState["inventory"] || "";
    charData.trainingScore = story.variablesState["training_score"] || 0;
    charData.sponsorPoints = story.variablesState["sponsor_points"] || 0;
}

// Animate health bar
function animateHealthBar(from, to) {
    const healthBar = document.getElementById('health');
    const duration = 500; // 500ms
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentWidth = from + (to - from) * easeOutQuart;
        
        healthBar.style.width = currentWidth + '%';
        
        // Change color based on health level
        if (currentWidth > 70) {
            healthBar.style.background = 'linear-gradient(90deg, #6bcf7f, #8ee4a2)';
        } else if (currentWidth > 30) {
            healthBar.style.background = 'linear-gradient(90deg, #ffd93d, #ffe066)';
        } else {
            healthBar.style.background = 'linear-gradient(90deg, #ff6b6b, #ff8e8e)';
        }
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// Show hint
function showHint() {
    const hints = [
        // Basic survival actions
        "Try typing 'search water' to find water sources",
        "Type 'hide' to find cover and avoid detection",
        "Use 'attack' to engage with other tributes",
        "Type 'eat' to consume your supplies",
        "Try 'run to the woods' to escape danger",
        "Type 'ask for sponsor gift' to request help from sponsors",
        "Use 'build shelter' to create a safe place to rest",
        "Try 'set trap' to catch food or defend your area",
        "Type 'hunt' to find food in the wilderness",
        "Use 'climb tree' to get a better view of your surroundings",
        
        // New massive update actions
        "Try 'craft weapon' to fashion tools from materials",
        "Type 'scout area' to survey for threats and resources",
        "Use 'rest' to recover energy and health",
        "Try 'make fire' for warmth and cooking",
        "Type 'search supplies' to scavenge for useful items",
        "Use 'defend position' to fortify your location",
        "Try 'negotiate' to form alliances with other tributes",
        "Type 'sabotage' to damage enemy supplies",
        "Use 'heal wounds' to treat your injuries",
        "Try 'create distraction' to escape or gain advantage",
        "Type 'study terrain' to find strategic advantages",
        "Use 'signal allies' to communicate with potential friends",
        "Try 'poison supplies' to eliminate competition",
        "Type 'build weapon' to construct sophisticated tools",
        "Use 'establish base' to create a permanent home",
        "Try 'gather intelligence' to spy on other tributes",
        "Type 'create map' to plan your strategy",
        "Use 'train skills' to improve your abilities",
        "Try 'barter' to trade with other tributes",
        "Type 'create armor' to fashion protective gear",
        "Use 'establish perimeter' to set up defenses",
        "Try 'analyze weather' to predict changes",
        "Type 'create medicine' to brew healing potions",
        "Use 'build bridge' to cross difficult terrain",
        "Try 'create camouflage' to hide better",
        "Type 'establish lookout' to monitor activity",
        "Use 'create decoy' to mislead enemies",
        "Try 'study wildlife' to learn about local animals",
        "Type 'create alarm' to set up warning systems",
        "Use 'build raft' to cross water obstacles",
        "Try 'create signal' to communicate with allies",
        "Type 'establish cache' to create hidden supplies",
        "Use 'create diversion' to orchestrate complex plans",
        "Try 'build catapult' to construct siege weapons",
        "Type 'create poison' to develop deadly toxins",
        "Use 'establish network' to create a spy network",
        "Try 'build fortress' to construct a heavily fortified base",
        "Type 'create army' to recruit and organize other tributes",
        "Use 'establish kingdom' to create a mini-empire",
        "Try 'create rebellion' to lead against the Capitol"
    ];
    
    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    
    // Show hint in a temporary popup
    const hintPopup = document.createElement('div');
    hintPopup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(20, 20, 20, 0.95);
        border: 2px solid #ffd93d;
        border-radius: 10px;
        padding: 20px;
        color: #e0e0e0;
        font-size: 1.1rem;
        text-align: center;
        z-index: 1000;
        backdrop-filter: blur(10px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        animation: fadeIn 0.3s ease;
        max-width: 400px;
        line-height: 1.4;
    `;
    hintPopup.textContent = randomHint;
    
    document.body.appendChild(hintPopup);
    
    // Remove hint after 4 seconds
    setTimeout(() => {
        hintPopup.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(hintPopup);
        }, 300);
    }, 4000);
}

// Add fadeOut animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        to { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
    }
`;
document.head.appendChild(style);
