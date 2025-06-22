// Global variables
let story;
let currentChoices = [];
let currentUser = null;
let authToken = localStorage.getItem('authToken');
let currentSaveId = null;
let gameStartTime = Date.now();

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

// --- CHEAT CODE SYSTEM ---
const konamiCode = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'
];
let konamiIndex = 0;
let cheatActive = false;
let cheatSequence = '';

// Konami code detection
window.addEventListener('keydown', (e) => {
    // Don't trigger on input fields for Konami code
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        console.log(`Konami progress: ${konamiIndex}/${konamiCode.length}`);
        if (konamiIndex === konamiCode.length) {
            cheatActive = true;
            konamiIndex = 0;
            cheatSequence = '';
            console.log('🎮 CHEAT CODE ACTIVATED! Type "Iamdevwin" to win!');
            showCheatHint();
        }
    } else {
        konamiIndex = 0;
    }
});

// Simple cheat code detection - just listen for the exact sequence
window.addEventListener('keydown', (e) => {
    if (!cheatActive) return;
    
    const key = e.key.toLowerCase();
    
    // Only track letters and numbers
    if (/[a-z0-9]/.test(key)) {
        cheatSequence += key;
        console.log(`Cheat sequence: ${cheatSequence}`);
        
        // Check if we have the full sequence
        if (cheatSequence === 'iamdevwin') {
            console.log('🏆 CHEAT WIN ACTIVATED! 🏆');
            activateCheatWin();
            cheatSequence = '';
            cheatActive = false;
        }
        // Reset if sequence doesn't match
        else if (!'iamdevwin'.startsWith(cheatSequence)) {
            cheatSequence = '';
        }
    }
    // Allow backspace
    else if (e.key === 'Backspace') {
        cheatSequence = cheatSequence.slice(0, -1);
        console.log(`Cheat sequence (backspace): ${cheatSequence}`);
    }
    // Allow escape to cancel
    else if (e.key === 'Escape') {
        cheatSequence = '';
        cheatActive = false;
        console.log('Cheat code cancelled');
    }
});

function activateCheatWin() {
    const storyContainer = document.getElementById('storyContainer');
    
    // Create win message
    const winText = document.createElement('p');
    winText.className = 'fade-in';
    winText.style.cssText = `
        color: #6bcf7f;
        font-weight: bold;
        font-size: 1.2rem;
        text-align: center;
        padding: 20px;
        background: rgba(107, 207, 127, 0.1);
        border: 2px solid #6bcf7f;
        border-radius: 10px;
        margin: 20px 0;
    `;
    winText.textContent = '🎉 CHEAT ACTIVATED: INSTANT WIN! 🎉\nYou are the champion of the Hunger Games!';
    
    storyContainer.appendChild(winText);
    storyContainer.scrollTop = storyContainer.scrollHeight;
    
    // Set story variables
    if (story && story.variablesState) {
        story.variablesState['instawin'] = true;
        story.variablesState['health'] = 100;
        story.variablesState['sponsor_points'] = 999;
    }
    
    // Submit to leaderboard
    submitLeaderboardEntry('cheat');
    
    // Show celebration
    setTimeout(() => {
        const celebration = document.createElement('p');
        celebration.className = 'fade-in';
        celebration.style.cssText = `
            color: #ffd93d;
            font-size: 1.1rem;
            text-align: center;
            margin: 10px 0;
        `;
        celebration.textContent = '🏆 Congratulations! You have won the Hunger Games! 🏆';
        storyContainer.appendChild(celebration);
        storyContainer.scrollTop = storyContainer.scrollHeight;
    }, 1000);
}

function showCheatHint() {
    const hintPopup = document.createElement('div');
    hintPopup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(20, 20, 20, 0.95);
        border: 3px solid #ffd93d;
        border-radius: 15px;
        padding: 30px;
        color: #ffd93d;
        font-size: 1.4rem;
        text-align: center;
        z-index: 2000;
        backdrop-filter: blur(10px);
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.7);
        animation: fadeIn 0.3s ease;
        max-width: 500px;
        line-height: 1.5;
        font-weight: bold;
    `;
    hintPopup.innerHTML = `
        <div style="margin-bottom: 15px;">🎮 CHEAT CODE ACTIVATED! 🎮</div>
        <div style="font-size: 1.1rem; margin-bottom: 20px;">Type <span style="color: #6bcf7f; font-family: monospace;">Iamdevwin</span> anywhere on the page to win!</div>
        <button onclick="this.parentElement.remove()" style="
            background: #ffd93d;
            color: #1a1a1a;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            font-weight: bold;
        ">Got it!</button>
    `;
    document.body.appendChild(hintPopup);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        if (document.body.contains(hintPopup)) {
            hintPopup.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(hintPopup)) {
                    document.body.removeChild(hintPopup);
                }
            }, 300);
        }
    }, 8000);
}

// Initialize the application
window.addEventListener('load', async () => {
    // Check authentication first
    await checkAuthentication();
    
    // Load the story immediately without waiting for inkjs
    await loadStory();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load user saves if authenticated
    if (currentUser && currentUser.id !== 'guest') {
        loadUserSaves();
    }
    
    // Load leaderboard preview
    loadLeaderboardPreview();
});

// Wait for inkjs to be available
async function waitForInkjs() {
    let attempts = 0;
    const maxAttempts = 3; // Reduced to 3 attempts
    
    while (typeof inkjs === 'undefined' && attempts < maxAttempts) {
        console.log(`Waiting for inkjs to load... attempt ${attempts + 1}/${maxAttempts}`);
        await new Promise(resolve => setTimeout(resolve, 200)); // Reduced to 200ms
        attempts++;
    }
    
    if (typeof inkjs === 'undefined') {
        console.log('inkjs not loaded, creating fallback story');
        return false;
    }
    
    console.log('inkjs library loaded successfully');
    return true;
}

// Check authentication status
async function checkAuthentication() {
    // First try to get user from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        try {
            currentUser = JSON.parse(storedUser);
            console.log('Found stored user:', currentUser.username);
        } catch (error) {
            console.error('Error parsing stored user:', error);
            localStorage.removeItem('currentUser');
        }
    }
    
    if (authToken) {
        try {
            const response = await fetch('/api/profile', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                currentUser = data.user;
                // Update localStorage with fresh user data
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                updateUserDisplay();
                console.log('User authenticated:', currentUser.username);
            } else {
                // Token invalid, clear it
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
                authToken = null;
                currentUser = { id: 'guest', username: 'Guest Player' };
                updateUserDisplay();
                console.log('Token invalid, switched to guest mode');
            }
        } catch (error) {
            console.error('Authentication check failed:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            authToken = null;
            currentUser = { id: 'guest', username: 'Guest Player' };
            updateUserDisplay();
            console.log('Auth check failed, switched to guest mode');
        }
    } else {
        // No auth token, use stored user or default to guest
        if (!currentUser) {
            currentUser = { id: 'guest', username: 'Guest Player' };
        }
        updateUserDisplay();
        console.log('No auth token, using:', currentUser.username);
    }
}

// Update user display
function updateUserDisplay() {
    const usernameElement = document.getElementById('username');
    const userStatusElement = document.querySelector('.user-info div:last-child');
    
    if (currentUser) {
        usernameElement.textContent = currentUser.username;
        if (currentUser.id === 'guest') {
            userStatusElement.textContent = 'Playing as guest (no saves)';
        } else {
            userStatusElement.textContent = 'Ready to enter the arena';
        }
        console.log('User display updated:', currentUser.username);
    }
}

// Load the story
async function loadStory() {
    try {
        console.log('Loading story...');
        
        // Try to wait for inkjs briefly
        const inkjsLoaded = await waitForInkjs();
        
        if (!inkjsLoaded) {
            // Create fallback story immediately
            createFallbackStory();
            return;
        }
        
        // Try to fetch the story file
        const response = await fetch('story.json');
        console.log('Story fetch response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const storyContent = await response.json();
        console.log('Story content loaded successfully:', storyContent);
        
        // Validate story structure
        if (!storyContent.inkVersion || !storyContent.root || !storyContent.knots) {
            throw new Error('Invalid story format: missing required fields');
        }
        
        story = new inkjs.Story(storyContent);
        console.log('Ink story created successfully');
        
        // Initialize story variables if they don't exist
        if (story.variablesState) {
            const defaultVariables = {
                "health": 100,
                "stamina": 100,
                "hunger": 0,
                "strength": 0,
                "knowledge": 0,
                "awareness": 0,
                "agility": 0,
                "stealth": 0,
                "idle": 0,
                "name": "",
                "age": 0,
                "district": "",
                "weapon": "",
                "inventory": "",
                "specialty": "",
                "gpt_response": "",
                "sponsor_points": 0,
                "training_score": 0,
                "instawin": false
            };
            
            // Set default values for all variables
            Object.keys(defaultVariables).forEach(key => {
                if (story.variablesState[key] === undefined) {
                    story.variablesState[key] = defaultVariables[key];
                }
            });
        }
        console.log('Story variables initialized');
        
        // Start the story
        continueStory();
        console.log('Story started successfully');
        
    } catch (error) {
        console.error('Error loading story:', error);
        createFallbackStory();
    }
}

// Create a simple working story as fallback
function createFallbackStory() {
    console.log('Creating fallback story...');
    
    // Create a simple story object
    const fallbackStory = {
        inkVersion: 20,
        root: [{
            "#n": "intro",
            "c": [{
                "#f": 1,
                "c": ["Welcome to Panem. The Capitol watches. The Districts remember.\n\nBefore we begin, let's get to know you.\n\nWhat is your name?\n"]
            }, {
                "#n": "g-0",
                "c": [{
                    "#f": 2,
                    "c": ["Enter your name"]
                }]
            }]
        }],
        listDefs: {},
        variables: [
            { "name": "health", "value": 100 },
            { "name": "name", "value": "" },
            { "name": "age", "value": 0 },
            { "name": "district", "value": "" },
            { "name": "weapon", "value": "" },
            { "name": "inventory", "value": "" },
            { "name": "sponsor_points", "value": 0 },
            { "name": "training_score", "value": 0 },
            { "name": "instawin", "value": false }
        ],
        knots: {
            "intro": {
                "c": [{
                    "#f": 1,
                    "c": ["Welcome to Panem. The Capitol watches. The Districts remember.\n\nBefore we begin, let's get to know you.\n\nWhat is your name?\n"]
                }, {
                    "#n": "g-0",
                    "c": [{
                        "#f": 2,
                        "c": ["Enter your name"]
                    }]
                }]
            }
        }
    };
    
    try {
        if (typeof inkjs !== 'undefined') {
            story = new inkjs.Story(fallbackStory);
            console.log('Fallback story created successfully with inkjs');
        } else {
            // Create a mock story object if inkjs is not available
            story = {
                canContinue: true,
                currentChoices: [{ text: "Enter your name" }],
                variablesState: {
                    "health": 100,
                    "name": "",
                    "age": 0,
                    "district": "",
                    "weapon": "",
                    "inventory": "",
                    "sponsor_points": 0,
                    "training_score": 0,
                    "instawin": false
                },
                Continue: function() {
                    this.canContinue = false;
                    return "Welcome to Panem. The Capitol watches. The Districts remember.\n\nBefore we begin, let's get to know you.\n\nWhat is your name?\n";
                },
                ChooseChoiceIndex: function(index) {
                    console.log('Choice selected:', index);
                    if (index === 0) {
                        // Name entered, continue to age selection
                        this.canContinue = true;
                        this.currentChoices = [
                            { text: "I'm 12 years old" },
                            { text: "I'm 13 years old" },
                            { text: "I'm 14 years old" },
                            { text: "I'm 15 years old" },
                            { text: "I'm 16 years old" },
                            { text: "I'm 17 years old" },
                            { text: "I'm 18 years old" }
                        ];
                    } else if (index >= 0 && index <= 6) {
                        // Age selected, continue to district selection
                        const ages = [12, 13, 14, 15, 16, 17, 18];
                        this.variablesState["age"] = ages[index];
                        this.canContinue = true;
                        this.currentChoices = [
                            { text: "District 1 - Luxury Items" },
                            { text: "District 2 - Masonry & Defense" },
                            { text: "District 3 - Technology" },
                            { text: "District 4 - Fishing" },
                            { text: "District 5 - Power" },
                            { text: "District 6 - Transportation" },
                            { text: "District 7 - Lumber" },
                            { text: "District 8 - Textiles" },
                            { text: "District 9 - Grain" },
                            { text: "District 10 - Livestock" },
                            { text: "District 11 - Agriculture" },
                            { text: "District 12 - Coal Mining" }
                        ];
                    } else if (index >= 0 && index <= 11) {
                        // District selected, continue to arena
                        const districts = [
                            "District 1 - Luxury Items",
                            "District 2 - Masonry & Defense", 
                            "District 3 - Technology",
                            "District 4 - Fishing",
                            "District 5 - Power",
                            "District 6 - Transportation",
                            "District 7 - Lumber",
                            "District 8 - Textiles",
                            "District 9 - Grain",
                            "District 10 - Livestock",
                            "District 11 - Agriculture",
                            "District 12 - Coal Mining"
                        ];
                        this.variablesState["district"] = districts[index];
                        this.canContinue = true;
                        this.currentChoices = [];
                        // Enter free roam mode
                    }
                }
            };
            console.log('Fallback story created successfully without inkjs');
        }
        
        // Clear loading message and start story
        const storyContainer = document.getElementById('storyContainer');
        storyContainer.innerHTML = '';
        continueStory();
        
    } catch (fallbackError) {
        console.error('Fallback story creation failed:', fallbackError);
        
        // Show error message
        const storyContainer = document.getElementById('storyContainer');
        storyContainer.innerHTML = `
            <div style="color: #ff6b6b; text-align: center; padding: 20px;">
                <h3>Story Loading Error</h3>
                <p>Error: ${fallbackError.message}</p>
                <p>Please refresh the page or try again later.</p>
                <button onclick="location.reload()" style="
                    background: #ff6b6b;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 10px;
                ">Refresh Page</button>
            </div>
        `;
    }
}

// Set up event listeners
function setupEventListeners() {
    const cmdInput = document.getElementById('cmdInput');
    const hintBtn = document.getElementById('hintBtn');
    const saveForm = document.getElementById('saveForm');
    const feedbackForm = document.getElementById('feedbackForm');
    
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
    
    // Handle save form
    saveForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveGame();
    });
    
    // Handle feedback form
    feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitFeedback();
    });
}

// Continue the story
function continueStory() {
    // Get the current story text
    let storyText = '';
    
    if (story && story.canContinue) {
        while (story.canContinue) {
            storyText += story.Continue();
        }
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

    if (story && story.currentChoices && story.currentChoices.length > 0) {
        currentChoices = story.currentChoices;

        const nameChoice = story.currentChoices.find(c => c.text.includes('Enter your name'));

        if (nameChoice) {
            const nameForm = document.createElement('div');
            nameForm.className = 'name-input-form fade-in';
            nameForm.innerHTML = `
                <input type="text" id="nameInput" placeholder="Enter your name..." autocomplete="off" style="width: 70%; padding: 10px; border-radius: 5px 0 0 5px; border: 1px solid #555; background: #333; color: #fff;">
                <button id="nameSubmitBtn" style="padding: 10px; border-radius: 0 5px 5px 0; border: 1px solid #555; background: #444; color: #fff; cursor: pointer;">Continue</button>
            `;
            choicesContainer.appendChild(nameForm);

            const nameInput = document.getElementById('nameInput');
            const nameSubmitBtn = document.getElementById('nameSubmitBtn');

            nameInput.focus();

            const submitName = () => {
                const name = nameInput.value.trim();
                story.variablesState["name"] = name || "Tribute";
                
                const choiceIndex = currentChoices.indexOf(nameChoice);
                story.ChooseChoiceIndex(choiceIndex);
                
                continueStory();
            };

            nameSubmitBtn.addEventListener('click', submitName);
            nameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    submitName();
                }
            });

        } else {
            story.currentChoices.forEach((choice, index) => {
                const choiceElement = document.createElement('div');
                choiceElement.className = 'choice fade-in';
                choiceElement.textContent = choice.text;
                choiceElement.addEventListener('click', () => {
                    choiceElement.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        choiceElement.style.transform = '';
                    }, 150);

                    story.ChooseChoiceIndex(index);
                    continueStory();
                });
                choicesContainer.appendChild(choiceElement);
            });
        }
    } else {
        showFreeRoamMode();
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
            
            // Display the AI response
            const aiResponseText = document.createElement('p');
            aiResponseText.className = 'fade-in';
            aiResponseText.style.color = '#e0e0e0';
            aiResponseText.style.lineHeight = '1.6';
            aiResponseText.textContent = data.response;
            storyContainer.appendChild(aiResponseText);
            
            // Set the GPT response in the story
            story.variablesState["gpt_response"] = data.response;
            
            // Update character stats after action
            updateCharacterStats();
            
        } else {
            const errorData = await response.json();
            console.error('Server error:', errorData);
            
            // Display error response if available
            if (errorData.response) {
                const errorResponseText = document.createElement('p');
                errorResponseText.className = 'fade-in';
                errorResponseText.style.color = '#e0e0e0';
                errorResponseText.style.lineHeight = '1.6';
                errorResponseText.textContent = errorData.response;
                storyContainer.appendChild(errorResponseText);
            } else {
                throw new Error('Failed to get AI response');
            }
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
    const healthValue = document.getElementById('healthValue');
    const currentWidth = parseInt(healthBar.style.width) || 100;
    const targetWidth = health;
    
    // Animate health bar change
    if (currentWidth !== targetWidth) {
        animateHealthBar(currentWidth, targetWidth);
    }
    
    healthValue.textContent = `${health}%`;
    
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

// Save game functionality
async function saveGame() {
    if (currentUser.id === 'guest') {
        alert('Guest players cannot save games. Please create an account to save your progress.');
        closeModal('saveModal');
        return;
    }
    
    const saveName = document.getElementById('saveName').value.trim();
    if (!saveName) {
        alert('Please enter a save name.');
        return;
    }
    
    try {
        const storyState = story.state.toJson();
        const characterData = {
            ...charData,
            playTimeMinutes: Math.floor((Date.now() - gameStartTime) / 60000)
        };
        
        const response = await fetch('/api/saves', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                saveName,
                storyState,
                characterData
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            currentSaveId = data.save.id;
            alert('Game saved successfully!');
            closeModal('saveModal');
            loadUserSaves(); // Refresh save list
        } else {
            const errorData = await response.json();
            alert(errorData.error || 'Failed to save game.');
        }
    } catch (error) {
        console.error('Save error:', error);
        alert('Failed to save game. Please try again.');
    }
}

// Load user saves
async function loadUserSaves() {
    if (currentUser.id === 'guest') {
        return;
    }
    
    try {
        const response = await fetch('/api/saves', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            displaySaves(data.saves);
        }
    } catch (error) {
        console.error('Load saves error:', error);
    }
}

// Display saves in sidebar
function displaySaves(saves) {
    const saveList = document.getElementById('saveList');
    
    if (saves.length === 0) {
        saveList.innerHTML = '<div style="text-align: center; color: #888; font-style: italic;">No saves yet</div>';
        return;
    }
    
    saveList.innerHTML = '';
    saves.forEach(save => {
        const saveItem = document.createElement('div');
        saveItem.className = 'save-item';
        saveItem.onclick = () => loadSave(save.id);
        
        const saveName = document.createElement('div');
        saveName.className = 'save-name';
        saveName.textContent = save.save_name;
        
        const saveDate = document.createElement('div');
        saveDate.className = 'save-date';
        saveDate.textContent = new Date(save.updated_at).toLocaleDateString();
        
        saveItem.appendChild(saveName);
        saveItem.appendChild(saveDate);
        saveList.appendChild(saveItem);
    });
}

// Load a specific save
async function loadSave(saveId) {
    try {
        const response = await fetch(`/api/saves/${saveId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const save = data.save;
            
            // Load story state
            story.state.loadJson(save.story_state);
            
            // Update character data
            Object.assign(charData, save.character_data);
            
            // Clear story container and continue
            document.getElementById('storyContainer').innerHTML = '';
            continueStory();
            
            currentSaveId = saveId;
            closeModal('loadModal');
            
            alert('Game loaded successfully!');
        } else {
            alert('Failed to load save.');
        }
    } catch (error) {
        console.error('Load save error:', error);
        alert('Failed to load save. Please try again.');
    }
}

// Show save modal
function showSaveModal() {
    if (currentUser.id === 'guest') {
        alert('Please create an account to save your game progress.');
        return;
    }
    document.getElementById('saveModal').style.display = 'block';
    document.getElementById('saveName').focus();
}

// Show load modal
function showLoadModal() {
    if (currentUser.id === 'guest') {
        alert('Please create an account to load saved games.');
        return;
    }
    document.getElementById('loadModal').style.display = 'block';
    loadSavesForModal();
}

// Load saves for modal
async function loadSavesForModal() {
    const loadSavesList = document.getElementById('loadSavesList');
    loadSavesList.innerHTML = '<div style="text-align: center; color: #888; font-style: italic;">Loading saves...</div>';
    
    try {
        const response = await fetch('/api/saves', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            displaySavesInModal(data.saves);
        } else {
            loadSavesList.innerHTML = '<div style="text-align: center; color: #ff6b6b;">Failed to load saves</div>';
        }
    } catch (error) {
        console.error('Load saves error:', error);
        loadSavesList.innerHTML = '<div style="text-align: center; color: #ff6b6b;">Failed to load saves</div>';
    }
}

// Display saves in modal
function displaySavesInModal(saves) {
    const loadSavesList = document.getElementById('loadSavesList');
    
    if (saves.length === 0) {
        loadSavesList.innerHTML = '<div style="text-align: center; color: #888; font-style: italic;">No saves found</div>';
        return;
    }
    
    loadSavesList.innerHTML = '';
    saves.forEach(save => {
        const saveItem = document.createElement('div');
        saveItem.className = 'save-item';
        saveItem.onclick = () => loadSave(save.id);
        
        const saveName = document.createElement('div');
        saveName.className = 'save-name';
        saveName.textContent = save.save_name;
        
        const saveDate = document.createElement('div');
        saveDate.className = 'save-date';
        saveDate.textContent = new Date(save.updated_at).toLocaleDateString();
        
        saveItem.appendChild(saveName);
        saveItem.appendChild(saveDate);
        loadSavesList.appendChild(saveItem);
    });
}

// Submit feedback
async function submitFeedback() {
    const subject = document.getElementById('feedbackSubject').value.trim();
    const message = document.getElementById('feedbackMessage').value.trim();
    const rating = document.getElementById('feedbackRating').value;
    
    if (!subject || !message) {
        alert('Please fill in all required fields.');
        return;
    }
    
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        const response = await fetch('/api/feedback', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                subject,
                message,
                rating: rating || null,
                username: currentUser.username
            })
        });
        
        if (response.ok) {
            alert('Feedback submitted successfully! Thank you for your input.');
            closeModal('feedbackModal');
            document.getElementById('feedbackForm').reset();
        } else {
            const errorData = await response.json();
            alert(errorData.error || 'Failed to submit feedback.');
        }
    } catch (error) {
        console.error('Submit feedback error:', error);
        alert('Failed to submit feedback. Please try again.');
    }
}

// Show feedback modal
function showFeedbackModal() {
    document.getElementById('feedbackModal').style.display = 'block';
    document.getElementById('feedbackSubject').focus();
}

// Show feedback list
function showFeedbackList() {
    document.getElementById('feedbackListModal').style.display = 'block';
    loadFeedbackList();
}

// Load feedback list
async function loadFeedbackList() {
    const feedbackList = document.getElementById('feedbackList');
    feedbackList.innerHTML = '<div style="text-align: center; color: #888; font-style: italic;">Loading feedback...</div>';
    
    try {
        const response = await fetch('/api/feedback');
        
        if (response.ok) {
            const data = await response.json();
            displayFeedbackList(data.feedback);
        } else {
            feedbackList.innerHTML = '<div style="text-align: center; color: #ff6b6b;">Failed to load feedback</div>';
        }
    } catch (error) {
        console.error('Load feedback error:', error);
        feedbackList.innerHTML = '<div style="text-align: center; color: #ff6b6b;">Failed to load feedback</div>';
    }
}

// Display feedback list
function displayFeedbackList(feedback) {
    const feedbackList = document.getElementById('feedbackList');
    
    if (feedback.length === 0) {
        feedbackList.innerHTML = '<div style="text-align: center; color: #888; font-style: italic;">No feedback yet</div>';
        return;
    }
    
    feedbackList.innerHTML = '';
    feedback.forEach(item => {
        const feedbackItem = document.createElement('div');
        feedbackItem.style.cssText = `
            background: rgba(40, 40, 40, 0.5);
            border: 1px solid #555;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
        `;
        
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        `;
        
        const title = document.createElement('div');
        title.style.cssText = `
            font-weight: 600;
            color: #ffd93d;
            font-size: 1.1rem;
        `;
        title.textContent = item.subject;
        
        const date = document.createElement('div');
        date.style.cssText = `
            font-size: 0.8rem;
            color: #888;
        `;
        date.textContent = new Date(item.created_at).toLocaleDateString();
        
        const message = document.createElement('div');
        message.style.cssText = `
            color: #e0e0e0;
            line-height: 1.5;
            margin-bottom: 8px;
        `;
        message.textContent = item.message;
        
        const footer = document.createElement('div');
        footer.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.9rem;
        `;
        
        const author = document.createElement('div');
        author.style.color = '#888';
        author.textContent = `By: ${item.username || 'Anonymous'}`;
        
        const rating = document.createElement('div');
        if (item.rating) {
            rating.textContent = '⭐'.repeat(item.rating);
        } else {
            rating.textContent = 'No rating';
            rating.style.color = '#888';
        }
        
        header.appendChild(title);
        header.appendChild(date);
        footer.appendChild(author);
        footer.appendChild(rating);
        
        feedbackItem.appendChild(header);
        feedbackItem.appendChild(message);
        feedbackItem.appendChild(footer);
        feedbackList.appendChild(feedbackItem);
    });
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Logout function
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.href = '/auth.html';
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
        
        // Advanced actions
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
        
        // Strategic actions
        "Type 'study terrain' to find strategic advantages",
        "Use 'signal allies' to communicate with potential friends",
        "Try 'poison supplies' to eliminate competition",
        "Type 'build weapon' to construct sophisticated tools",
        "Use 'establish base' to create a permanent home",
        "Try 'gather intelligence' to spy on other tributes",
        "Type 'create map' to plan your strategy",
        "Use 'train skills' to improve your abilities",
        "Try 'barter' to trade with other tributes",
        "Type 'create armor' to fashion protective gear"
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

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// --- LEADERBOARD SUBMISSION ---
async function submitLeaderboardEntry(type = 'normal') {
    try {
        console.log('Submitting leaderboard entry...');
        
        // Get current user info
        const username = currentUser ? currentUser.username : 'Anonymous';
        
        // Get character data from current story state
        const characterData = {
            name: story && story.variablesState ? (story.variablesState["name"] || "Anonymous") : "Anonymous",
            district: story && story.variablesState ? (story.variablesState["district"] || "Unknown") : "Unknown",
            age: story && story.variablesState ? (story.variablesState["age"] || 0) : 0,
            weapon: story && story.variablesState ? (story.variablesState["weapon"] || "") : "",
            inventory: story && story.variablesState ? (story.variablesState["inventory"] || "") : "",
            trainingScore: story && story.variablesState ? (story.variablesState["training_score"] || 0) : 0,
            sponsorPoints: story && story.variablesState ? (story.variablesState["sponsor_points"] || 0) : 0
        };
        
        // Determine win type - special case for Dev user
        let winType = 'Hunger Games Champion';
        if (type === 'cheat' || (story && story.variablesState && story.variablesState["instawin"])) {
            if (username === 'Dev') {
                winType = 'Hunger Games Champion'; // Regular win for Dev
            } else {
                winType = 'Cheat Win'; // Cheat win for everyone else
            }
        }
        
        console.log('Submitting win for:', username, 'District:', characterData.district, 'Type:', winType);
        
        const response = await fetch('/api/leaderboard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                username: username,
                district: characterData.district || 'Unknown',
                winType: winType
            })
        });
        
        if (response.ok) {
            console.log('✅ Win submitted to leaderboard successfully');
            // Refresh leaderboard preview
            loadLeaderboardPreview();
        } else {
            const errorData = await response.json();
            console.error('❌ Failed to submit to leaderboard:', errorData);
        }
    } catch (error) {
        console.error('❌ Error submitting to leaderboard:', error);
    }
}

// Show leaderboard modal
function showLeaderboardModal() {
    document.getElementById('leaderboardModal').style.display = 'block';
    loadLeaderboardList();
}

// Load leaderboard list
async function loadLeaderboardList() {
    try {
        const response = await fetch('/api/leaderboard');
        if (response.ok) {
            const data = await response.json();
            displayLeaderboardList(data.leaderboard);
        } else {
            document.getElementById('leaderboardList').innerHTML = 
                '<div style="text-align: center; color: #ff6b6b;">Failed to load leaderboard</div>';
        }
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        document.getElementById('leaderboardList').innerHTML = 
            '<div style="text-align: center; color: #ff6b6b;">Error loading leaderboard</div>';
    }
}

// Display leaderboard list
function displayLeaderboardList(leaderboard) {
    const leaderboardList = document.getElementById('leaderboardList');
    
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<div style="text-align: center; color: #888; font-style: italic;">No winners yet</div>';
        return;
    }
    
    leaderboardList.innerHTML = '';
    leaderboard.forEach((entry, index) => {
        const leaderboardItem = document.createElement('div');
        leaderboardItem.className = 'leaderboard-item';
        
        const rank = document.createElement('div');
        rank.className = 'leaderboard-rank';
        rank.textContent = `#${index + 1} Champion`;
        
        const username = document.createElement('div');
        username.className = 'leaderboard-username';
        username.textContent = entry.username;
        
        const details = document.createElement('div');
        details.className = 'leaderboard-details';
        details.innerHTML = `
            <div>District: ${entry.district || 'Unknown'}</div>
            <div>Wins: <span class="win-count">${entry.wins}</span></div>
            <div>Last Win: ${new Date(entry.last_win).toLocaleDateString()}</div>
            <div>Win Types: <span class="win-types">${entry.win_types || 'Unknown'}</span></div>
        `;
        
        leaderboardItem.appendChild(rank);
        leaderboardItem.appendChild(username);
        leaderboardItem.appendChild(details);
        leaderboardList.appendChild(leaderboardItem);
    });
}

// Load leaderboard preview for sidebar
async function loadLeaderboardPreview() {
    try {
        const response = await fetch('/api/leaderboard?limit=3');
        if (response.ok) {
            const data = await response.json();
            displayLeaderboardPreview(data.leaderboard);
        } else {
            document.getElementById('leaderboardPreview').innerHTML = 
                '<div style="color: #888;">Failed to load</div>';
        }
    } catch (error) {
        console.error('Error loading leaderboard preview:', error);
        document.getElementById('leaderboardPreview').innerHTML = 
            '<div style="color: #888;">Error loading</div>';
    }
}

// Display leaderboard preview
function displayLeaderboardPreview(leaderboard) {
    const preview = document.getElementById('leaderboardPreview');
    
    if (leaderboard.length === 0) {
        preview.innerHTML = '<div style="color: #888;">No winners yet</div>';
        return;
    }
    
    let previewHTML = '';
    leaderboard.slice(0, 3).forEach((entry, index) => {
        previewHTML += `
            <div style="margin-bottom: 5px; font-size: 0.75rem;">
                <span style="color: #ffd93d;">#${index + 1}</span> 
                <span style="color: #e0e0e0;">${entry.username}</span>
                <br><span style="color: #6bcf7f; font-size: 0.7rem;">${entry.wins} wins</span>
            </div>
        `;
    });
    
    preview.innerHTML = previewHTML;
}
