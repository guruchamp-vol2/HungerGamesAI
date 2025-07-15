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
            console.log('InkJS not loaded, creating fallback story...');
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
        if (!storyContent.inkVersion || !storyContent.root) {
            throw new Error('Invalid story format: missing required fields');
        }
        
        // Check if this is a newer Ink version that might cause compatibility issues
        if (storyContent.inkVersion >= 21) {
            console.log('Detected Ink v21+ story, attempting to load with newer format...');
        }
        
        try {
            story = new inkjs.Story(storyContent);
            console.log('Ink story created successfully');
            
        } catch (inkError) {
            console.error('InkJS error creating story:', inkError);
            
            // If it's the specific token conversion error, use fallback
            if (inkError.message && inkError.message.includes('Failed to convert token to runtime object')) {
                console.log('Detected Ink v21 compatibility issue, using fallback story...');
                createFallbackStory();
                return;
            }
            
            // For other errors, re-throw
            throw inkError;
        }
        
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
    const storyContainer = document.getElementById('storyContainer');

    // Continue until choices are available or story ends
    while (story && story.canContinue && (!story.currentChoices || story.currentChoices.length === 0)) {
        const storyText = story.Continue();

        // Display each piece of story text as a separate paragraph
    if (storyText && storyText.trim()) {
        const newText = document.createElement('p');
        newText.className = 'fade-in';
        newText.textContent = storyText.trim();
        storyContainer.appendChild(newText);
            
            // Smooth scroll to the new text
            setTimeout(() => {
        storyContainer.scrollTop = storyContainer.scrollHeight;
            }, 50);
        }
    }

    // Check if we're in free roam mode
    console.log("[Debug] Checking free roam mode...");
    console.log("[Debug] Current tags:", story?.currentTags);
    console.log("[Debug] Current path:", story?.state?.currentPath?.toString());
    
    if (story && story.currentTags && story.currentTags.includes('free_roam')) {
        console.log("[Debug] Free roam detected via tags");
        // We're in free roam mode, show input and initialize arena
        showFreeRoamMode();
        if (enemies.length === 0) {
            initializeArena();
        }
        return; // Don't display choices in free roam mode
    }
    
    // Alternative check for free roam mode by looking at current knot name
    if (story && story.state && story.state.currentPath && story.state.currentPath.toString().includes('free_roam')) {
        console.log("[Debug] Free roam detected via path");
        // We're in free roam mode, show input and initialize arena
        showFreeRoamMode();
        if (enemies.length === 0) {
            initializeArena();
        }
        return; // Don't display choices in free roam mode
    }
    // Not in free roam, hide input
    setFreeRoamMode(false);

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

        story.currentChoices.forEach((choice, index) => {
            const choiceElement = document.createElement('div');
            choiceElement.className = 'choice fade-in';
            choiceElement.textContent = choice.text;
            choiceElement.addEventListener('click', () => {
                choiceElement.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    choiceElement.style.transform = '';
                }, 150);

                console.log(`[Debug] Choice clicked: '${choice.text}' at index: ${index}`);
                
                if (story) {
                    story.ChooseChoiceIndex(index);
                }

                console.log("[Debug] Choice selected. Continuing story...");
                continueStory();

                // Fallback: if path is undefined, try to unstick
                setTimeout(() => {
                    if (!story.state || !story.state.currentPath) {
                        if (freeRoamUnstickTries < 3) {
                            freeRoamUnstickTries++;
                            console.log(`[Debug] Path still undefined after choice, retrying continueStory() (${freeRoamUnstickTries})`);
                            continueStory();
                        } else {
                            console.log('[Debug] Gave up trying to unstick free roam mode.');
                        }
                    } else {
                        freeRoamUnstickTries = 0;
                    }
                }, 100);
            });
            choicesContainer.appendChild(choiceElement);
        });
    } else if (story && !story.canContinue && 
               !story.currentTags?.includes('free_roam') && 
               !(story.state && story.state.currentPath && story.state.currentPath.toString().includes('free_roam'))) {
        // Story is waiting for input or has ended (but not in free roam mode)
        setFreeRoamMode(true);
    }
}

// Show free roam mode
function showFreeRoamMode() {
    setFreeRoamMode(true);
}

// Handle free roam actions
async function handleFreeRoamAction(action) {
    const typingIndicator = document.getElementById('typingIndicator');
    const storyContainer = document.getElementById('storyContainer');
    
    // Check if player is dead
    if (story && story.variablesState && story.variablesState["player_dead"]) {
        const deathText = document.createElement('p');
        deathText.className = 'fade-in';
        deathText.style.color = '#ff6b6b';
        deathText.textContent = "You are dead. The Games are over for you.";
        storyContainer.appendChild(deathText);
        storyContainer.scrollTop = storyContainer.scrollHeight;
        return;
    }
    
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
        // Handle movement commands
        const movementResult = handleMovement(action);
        if (movementResult) {
            // Move enemies after player moves
            moveEnemies();
            
            // Check for encounters
            const encounterResult = checkEncounters();
            if (encounterResult) {
                const encounterText = document.createElement('p');
                encounterText.className = 'fade-in';
                encounterText.style.color = '#e0e0e0';
                encounterText.textContent = encounterResult;
                storyContainer.appendChild(encounterText);
            }
            
            // Update character stats
            updateCharacterStats();
            
            // Hide typing indicator
            typingIndicator.style.display = 'none';
            storyContainer.scrollTop = storyContainer.scrollHeight;
            return;
        }
        
        // Handle predefined actions from the Ink story
        const predefinedResult = handlePredefinedAction(action);
        if (predefinedResult) {
            // Move enemies after action
            moveEnemies();
            
            // Check for encounters
            const encounterResult = checkEncounters();
            if (encounterResult) {
                const encounterText = document.createElement('p');
                encounterText.className = 'fade-in';
                encounterText.style.color = '#e0e0e0';
                encounterText.textContent = encounterResult;
                storyContainer.appendChild(encounterText);
            }
            
            // Update character stats
            updateCharacterStats();
            
            // Hide typing indicator
            typingIndicator.style.display = 'none';
            storyContainer.scrollTop = storyContainer.scrollHeight;
            return;
        }
        
        // Process action through Ink story
        console.log('[Debug] Processing action through Ink story:', action);
        
        // Set the action input in the story
        story.variablesState["action_input"] = action;
        
        // Continue the story to process the action
        story.Continue();
        
        // Get the current text (which should include the action result)
        const currentText = story.currentText;
        console.log('[Debug] Story response:', currentText);
        
        // Display the story response
        if (currentText && currentText.trim()) {
            const storyResponseText = document.createElement('p');
            storyResponseText.className = 'fade-in';
            storyResponseText.style.color = '#e0e0e0';
            storyResponseText.style.lineHeight = '1.6';
            storyResponseText.textContent = currentText;
            storyContainer.appendChild(storyResponseText);
        }
        
        // Update character stats after action
        updateCharacterStats();
        
    } catch (error) {
        console.error('Error processing action:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        
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

// Handle movement commands
function handleMovement(action) {
    const actionLower = action.toLowerCase();
    
    // Movement commands
    if (actionLower.includes('north') || actionLower.includes('up')) {
        if (playerPosition.y > 0) {
            playerPosition.y--;
            return "You move north through the arena.";
        }
        return "You can't go further north - you've reached the arena boundary.";
    }
    
    if (actionLower.includes('south') || actionLower.includes('down')) {
        if (playerPosition.y < 7) {
            playerPosition.y++;
            return "You move south through the arena.";
        }
        return "You can't go further south - you've reached the arena boundary.";
    }
    
    if (actionLower.includes('west') || actionLower.includes('left')) {
        if (playerPosition.x > 0) {
            playerPosition.x--;
            return "You move west through the arena.";
        }
        return "You can't go further west - you've reached the arena boundary.";
    }
    
    if (actionLower.includes('east') || actionLower.includes('right')) {
        if (playerPosition.x < 7) {
            playerPosition.x++;
            return "You move east through the arena.";
        }
        return "You can't go further east - you've reached the arena boundary.";
    }
    
    // Special movement commands
    if (actionLower.includes('explore') || actionLower.includes('search')) {
        // Random movement in a direction
        const directions = ['north', 'south', 'east', 'west'];
        const direction = directions[Math.floor(Math.random() * directions.length)];
        return handleMovement(direction);
    }
    
    return null; // Not a movement command
}

// Handle predefined actions from the Ink story
function handlePredefinedAction(action) {
    const actionLower = action.toLowerCase();
    
    // Climb a tree action
    if (actionLower.includes('climb') && actionLower.includes('tree')) {
        if (story && story.variablesState) {
            // Update story variables to match the Ink story choice
            story.variablesState["player_stealth"] = (story.variablesState["player_stealth"] || 0) + 1;
            story.variablesState["days_survived"] = (story.variablesState["days_survived"] || 0) + 1;
            
            // Add sponsor points (as mentioned in README)
            story.variablesState["sponsor_points"] = (story.variablesState["sponsor_points"] || 0) + 7;
        }
        return "You carefully scale a massive oak tree, your hands finding purchase in the rough bark. From your elevated perch, you gain a commanding view of the arena - to the north, you spot a clearing that might contain supplies, while to the east, you notice movement that could be other tributes. The height gives you both safety and strategic advantage.";
    }
    
    // Search for water action
    if (actionLower.includes('search') && actionLower.includes('water')) {
        if (story && story.variablesState) {
            story.variablesState["player_health"] = Math.min((story.variablesState["player_health"] || 100) + 10, 100);
            story.variablesState["days_survived"] = (story.variablesState["days_survived"] || 0) + 1;
            story.variablesState["tributes_remaining"] = Math.max((story.variablesState["tributes_remaining"] || 24) - 2, 1);
            story.variablesState["sponsor_points"] = (story.variablesState["sponsor_points"] || 0) + 5;
        }
        return "You follow the sound of running water and discover a small stream cutting through the arena. The water is murky but flowing, which reduces the risk of contamination. You carefully filter it through your clothing, removing debris before taking long, grateful gulps. The cool water revitalizes you, and you fill your water bottle for later.";
    }
    
    // Hide action
    if (actionLower.includes('hide') || actionLower.includes('hide in brush')) {
        if (story && story.variablesState) {
            story.variablesState["player_stealth"] = (story.variablesState["player_stealth"] || 0) + 1;
            story.variablesState["days_survived"] = (story.variablesState["days_survived"] || 0) + 1;
            story.variablesState["tributes_remaining"] = Math.max((story.variablesState["tributes_remaining"] || 24) - 1, 1);
            story.variablesState["sponsor_points"] = (story.variablesState["sponsor_points"] || 0) + 3;
        }
        return "You slip into a dense thicket of brambles and underbrush, your movements silent and deliberate. The sharp thorns scratch at your skin, but the pain is worth the concealment. From your hiding spot, you can see without being seen, and you use this advantage to observe the arena around you. The rustling of leaves and distant sounds of other tributes remind you that you're not alone.";
    }
    
    // Attack action
    if (actionLower.includes('attack') || actionLower.includes('attack nearby tribute')) {
        if (story && story.variablesState) {
            story.variablesState["player_strength"] = (story.variablesState["player_strength"] || 0) + 1;
            story.variablesState["tributes_remaining"] = Math.max((story.variablesState["tributes_remaining"] || 24) - 1, 1);
            story.variablesState["sponsor_points"] = (story.variablesState["sponsor_points"] || 0) + 10;
        }
        return "You spot a tribute from District 7 moving through the trees ahead. Adrenaline courses through your veins as you decide to engage. You charge forward, your weapon raised, and the tribute turns just in time to see you coming. The clash is brutal and decisive - steel meets steel, and the arena echoes with the sounds of combat. This fight will determine which of you survives.";
    }
    
    // Eat action
    if (actionLower.includes('eat') || actionLower.includes('eat supplies')) {
        if (story && story.variablesState) {
            story.variablesState["player_health"] = Math.min((story.variablesState["player_health"] || 100) + 15, 100);
            story.variablesState["days_survived"] = (story.variablesState["days_survived"] || 0) + 1;
            story.variablesState["sponsor_points"] = (story.variablesState["sponsor_points"] || 0) + 2;
        }
        return "You find a relatively safe spot behind a fallen log and carefully ration your supplies. The bread is stale but filling, and the dried meat provides much-needed protein. As you eat, you feel your strength returning and your mind becoming sharper. You save some food for later, knowing that in the arena, every resource is precious.";
    }
    
    // Run to woods action
    if (actionLower.includes('run') && actionLower.includes('woods')) {
        if (story && story.variablesState) {
            story.variablesState["player_stealth"] = (story.variablesState["player_stealth"] || 0) + 1;
            story.variablesState["days_survived"] = (story.variablesState["days_survived"] || 0) + 1;
            story.variablesState["sponsor_points"] = (story.variablesState["sponsor_points"] || 0) + 5;
        }
        return "You sprint deeper into the woods, putting distance between you and danger. The trees provide cover as you disappear into the wilderness.";
    }
    
    // Ask for sponsor gift action
    if (actionLower.includes('ask') && actionLower.includes('sponsor') && actionLower.includes('gift')) {
        if (story && story.variablesState) {
            story.variablesState["player_health"] = Math.min((story.variablesState["player_health"] || 100) + 20, 100);
            story.variablesState["player_inventory"] = (story.variablesState["player_inventory"] || "") + ", Sponsor gift";
        }
        return "A silver parachute drifts down from the sky! Inside you find medicine and food. The sponsors have noticed your efforts.";
    }
    
    // Build shelter action
    if (actionLower.includes('build') && actionLower.includes('shelter')) {
        if (story && story.variablesState) {
            story.variablesState["player_stealth"] = (story.variablesState["player_stealth"] || 0) + 1;
            story.variablesState["days_survived"] = (story.variablesState["days_survived"] || 0) + 1;
            story.variablesState["sponsor_points"] = (story.variablesState["sponsor_points"] || 0) + 8;
        }
        return "You construct a crude shelter from branches and leaves. It's not much, but it provides some protection from the elements and prying eyes.";
    }
    
    // Set trap action
    if (actionLower.includes('set') && actionLower.includes('trap')) {
        if (story && story.variablesState) {
            story.variablesState["player_knowledge"] = (story.variablesState["player_knowledge"] || 0) + 1;
            story.variablesState["tributes_remaining"] = Math.max((story.variablesState["tributes_remaining"] || 24) - 1, 1);
            story.variablesState["sponsor_points"] = (story.variablesState["sponsor_points"] || 0) + 12;
        }
        return "You carefully set up a snare trap. With any luck, it will catch food or eliminate a threat without direct confrontation.";
    }
    
    // Hunt action
    if (actionLower.includes('hunt') || actionLower.includes('hunt for food')) {
        if (story && story.variablesState) {
            story.variablesState["player_strength"] = (story.variablesState["player_strength"] || 0) + 1;
            story.variablesState["player_health"] = Math.min((story.variablesState["player_health"] || 100) + 10, 100);
            story.variablesState["days_survived"] = (story.variablesState["days_survived"] || 0) + 1;
            story.variablesState["sponsor_points"] = (story.variablesState["sponsor_points"] || 0) + 15;
        }
        return "You track and catch a small animal. The meat provides much-needed sustenance and energy.";
    }
    
    return null; // Not a predefined action
}

// Update character stats display
function updateCharacterStats() {
    if (!story || !story.variablesState) return;
    
    // Update basic stats from Ink variables
    const playerName = story.variablesState["player_name"] || story.variablesState["name"] || "-";
    const playerDistrict = story.variablesState["player_district"] || story.variablesState["district"] || "-";
    const playerAge = story.variablesState["player_age"] || story.variablesState["age"] || "-";
    const playerWeapon = story.variablesState["player_weapon"] || story.variablesState["weapon"] || "-";
    const playerInventory = story.variablesState["player_inventory"] || story.variablesState["inventory"] || "-";
    const playerHealth = story.variablesState["player_health"] || story.variablesState["health"] || 100;
    const playerStrength = story.variablesState["player_strength"] || 0;
    const playerStealth = story.variablesState["player_stealth"] || 0;
    const playerKnowledge = story.variablesState["player_knowledge"] || 0;
    const daysSurvived = story.variablesState["days_survived"] || 0;
    const tributesRemaining = story.variablesState["tributes_remaining"] || 24;
    
    // Update UI elements
    document.getElementById('charName').textContent = playerName;
    document.getElementById('charDistrict').textContent = playerDistrict;
    document.getElementById('charAge').textContent = playerAge;
    document.getElementById('charWeapon').textContent = playerWeapon;
    document.getElementById('charInventory').textContent = playerInventory;
    document.getElementById('charStrength').textContent = playerStrength;
    document.getElementById('charStealth').textContent = playerStealth;
    document.getElementById('charKnowledge').textContent = playerKnowledge;
    
    // Update health bar with animation
    const healthBar = document.getElementById('health');
    const healthValue = document.getElementById('healthValue');
    const currentWidth = parseInt(healthBar.style.width) || 100;
    const targetWidth = playerHealth;
    
    // Animate health bar change
    if (currentWidth !== targetWidth) {
        animateHealthBar(currentWidth, targetWidth);
    }
    
    healthValue.textContent = `${playerHealth}%`;
    
    // Update character data object
    charData.name = playerName;
    charData.district = playerDistrict;
    charData.age = playerAge;
    charData.health = playerHealth;
    charData.weapon = playerWeapon;
    charData.inventory = playerInventory;
    charData.trainingScore = story.variablesState["training_score"] || 0;
    charData.sponsorPoints = story.variablesState["sponsor_points"] || 0;
    
    // Update mini-map
    updateMiniMap();
    
    // Add arena info if available
    if (daysSurvived > 0 || tributesRemaining < 24) {
        const arenaInfo = document.createElement('div');
        arenaInfo.style.cssText = `
            color: #ffd93d;
            font-size: 0.9rem;
            margin-top: 5px;
            text-align: center;
        `;
        arenaInfo.textContent = `Day ${daysSurvived + 1} • ${tributesRemaining} tributes remain`;
        
        // Remove old arena info if it exists
        const oldArenaInfo = document.querySelector('.arena-info');
        if (oldArenaInfo) {
            oldArenaInfo.remove();
        }
        
        arenaInfo.className = 'arena-info';
        document.querySelector('.character-stats').appendChild(arenaInfo);
    }
}

// Mini-map functionality
let playerPosition = { x: 4, y: 4 };
let enemies = [];
let supplies = [];
let waterSources = [];
let freeRoamUnstickTries = 0;

function updateMiniMap() {
    const mapGrid = document.getElementById('mapGrid');
    if (!mapGrid) return;
    
    // Clear existing map
    mapGrid.innerHTML = '';
    
    // Generate 8x8 grid
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const cell = document.createElement('div');
            cell.className = 'map-cell';
            
            // Check what's at this position
            if (x === playerPosition.x && y === playerPosition.y) {
                cell.classList.add('player');
            } else if (enemies.some(enemy => enemy.x === x && enemy.y === y)) {
                cell.classList.add('enemy');
            } else if (supplies.some(supply => supply.x === x && supply.y === y)) {
                cell.classList.add('supply');
            } else if (waterSources.some(water => water.x === x && water.y === y)) {
                cell.classList.add('water');
            }
            
            mapGrid.appendChild(cell);
        }
    }
}

// Initialize arena with enemies and resources
function initializeArena() {
    // Clear existing entities
    enemies = [];
    supplies = [];
    waterSources = [];
    
    // Add enemies (other tributes)
    const numEnemies = Math.min(8, Math.floor(Math.random() * 6) + 3);
    for (let i = 0; i < numEnemies; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * 8);
            y = Math.floor(Math.random() * 8);
        } while (x === playerPosition.x && y === playerPosition.y);
        
        enemies.push({ x, y, health: 100, strength: Math.floor(Math.random() * 5) + 1 });
    }
    
    // Add supplies
    const numSupplies = Math.floor(Math.random() * 4) + 2;
    for (let i = 0; i < numSupplies; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * 8);
            y = Math.floor(Math.random() * 8);
        } while ((x === playerPosition.x && y === playerPosition.y) || 
                 enemies.some(enemy => enemy.x === x && enemy.y === y));
        
        supplies.push({ x, y, type: ['food', 'medicine', 'weapon'][Math.floor(Math.random() * 3)] });
    }
    
    // Add water sources
    const numWater = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numWater; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * 8);
            y = Math.floor(Math.random() * 8);
        } while ((x === playerPosition.x && y === playerPosition.y) || 
                 enemies.some(enemy => enemy.x === x && enemy.y === y) ||
                 supplies.some(supply => supply.x === x && supply.y === y));
        
        waterSources.push({ x, y });
    }
    
    updateMiniMap();
}

// Enemy AI - move enemies randomly
function moveEnemies() {
    enemies.forEach(enemy => {
        if (Math.random() < 0.3) { // 30% chance to move
            const directions = [
                { dx: 0, dy: -1 }, // up
                { dx: 0, dy: 1 },  // down
                { dx: -1, dy: 0 }, // left
                { dx: 1, dy: 0 }   // right
            ];
            
            const direction = directions[Math.floor(Math.random() * directions.length)];
            const newX = Math.max(0, Math.min(7, enemy.x + direction.dx));
            const newY = Math.max(0, Math.min(7, enemy.y + direction.dy));
            
            // Don't move if position is occupied
            if (!enemies.some(e => e.x === newX && e.y === newY) &&
                !supplies.some(s => s.x === newX && s.y === newY) &&
                !waterSources.some(w => w.x === newX && w.y === newY)) {
                enemy.x = newX;
                enemy.y = newY;
            }
        }
    });
    
    updateMiniMap();
}

// Check for encounters
function checkEncounters() {
    // Check if player is near enemies
    const nearbyEnemies = enemies.filter(enemy => 
        Math.abs(enemy.x - playerPosition.x) <= 1 && 
        Math.abs(enemy.y - playerPosition.y) <= 1
    );
    
    if (nearbyEnemies.length > 0) {
        // Trigger combat or stealth check
        const enemy = nearbyEnemies[0];
        const playerStealth = story.variablesState["player_stealth"] || 0;
        
        if (playerStealth > 3 && Math.random() < 0.7) {
            // Successfully hide
            return "You spot an enemy nearby and successfully hide in the shadows.";
        } else {
            // Combat initiated
            return initiateCombat(enemy);
        }
    }
    
    // Check if player found supplies
    const nearbySupplies = supplies.filter(supply => 
        supply.x === playerPosition.x && supply.y === playerPosition.y
    );
    
    if (nearbySupplies.length > 0) {
        const supply = nearbySupplies[0];
        supplies = supplies.filter(s => s !== supply);
        updateMiniMap();
        
        switch (supply.type) {
            case 'food':
                story.variablesState["player_health"] = Math.min(100, (story.variablesState["player_health"] || 100) + 20);
                return "You found food! Your health increases.";
            case 'medicine':
                story.variablesState["player_health"] = Math.min(100, (story.variablesState["player_health"] || 100) + 30);
                return "You found medicine! Your health increases significantly.";
            case 'weapon':
                story.variablesState["player_strength"] = (story.variablesState["player_strength"] || 0) + 2;
                return "You found a weapon! Your strength increases.";
        }
    }
    
    // Check if player found water
    const nearbyWater = waterSources.filter(water => 
        water.x === playerPosition.x && water.y === playerPosition.y
    );
    
    if (nearbyWater.length > 0) {
        story.variablesState["player_health"] = Math.min(100, (story.variablesState["player_health"] || 100) + 10);
        return "You found water! Your health increases slightly.";
    }
    
    return null;
}

// Combat system
function initiateCombat(enemy) {
    const playerStrength = story.variablesState["player_strength"] || 0;
    const playerHealth = story.variablesState["player_health"] || 100;
    
    // Simple combat calculation
    const playerPower = playerStrength + Math.random() * 5;
    const enemyPower = enemy.strength + Math.random() * 5;
    
    if (playerPower > enemyPower) {
        // Player wins
        enemies = enemies.filter(e => e !== enemy);
        story.variablesState["player_strength"] = playerStrength + 1;
        story.variablesState["tributes_remaining"] = Math.max(1, (story.variablesState["tributes_remaining"] || 24) - 1);
        updateMiniMap();
        return `You defeat the enemy tribute! Your strength increases. ${story.variablesState["tributes_remaining"]} tributes remain.`;
    } else {
        // Player loses
        const damage = Math.floor(Math.random() * 20) + 10;
        story.variablesState["player_health"] = Math.max(0, playerHealth - damage);
        return `You lose the fight and take ${damage} damage! Your health is now ${story.variablesState["player_health"]}.`;
    }
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

// Helper to show/hide free roam input
function setFreeRoamMode(isActive) {
    const inputSection = document.querySelector('.input-section');
    if (isActive) {
        inputSection.style.display = 'block';
        setTimeout(() => {
            document.getElementById('cmdInput').focus();
        }, 100);
        console.log('[Debug] Free roam input box SHOWN');
    } else {
        inputSection.style.display = 'none';
        console.log('[Debug] Free roam input box HIDDEN');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, initializing game...');
    
    // Check authentication first
    await checkAuthentication();
    
    // Load the story
    await loadStory();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadUserSaves();
    loadFeedbackList();
    loadLeaderboardPreview();
    
    console.log('Game initialization complete');
});
