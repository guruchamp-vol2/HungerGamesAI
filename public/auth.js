// Authentication state
let currentUser = null;
let authToken = localStorage.getItem('authToken');

// Check if user is already logged in
if (authToken) {
    // Verify token and redirect to game
    verifyToken();
}

// Form toggle functions
function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    clearMessages();
}

function showLogin() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    clearMessages();
}

// Clear all messages
function clearMessages() {
    document.querySelectorAll('.error-message, .success-message').forEach(msg => {
        msg.style.display = 'none';
        msg.textContent = '';
    });
}

// Show error message
function showError(formId, message) {
    const errorElement = document.getElementById(formId + 'Error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Show success message
function showSuccess(formId, message) {
    const successElement = document.getElementById(formId + 'Success');
    successElement.textContent = message;
    successElement.style.display = 'block';
}

// Set loading state
function setLoading(formId, loading) {
    const btn = document.getElementById(formId + 'Btn');
    const loadingDiv = document.getElementById(formId + 'Loading');
    
    if (loading) {
        btn.disabled = true;
        loadingDiv.style.display = 'block';
    } else {
        btn.disabled = false;
        loadingDiv.style.display = 'none';
    }
}

// Verify token and redirect to game
async function verifyToken() {
    try {
        const response = await fetch('/api/profile', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            redirectToGame();
        } else {
            // Token invalid, remove it
            localStorage.removeItem('authToken');
            authToken = null;
        }
    } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('authToken');
        authToken = null;
    }
}

// Redirect to game
function redirectToGame() {
    window.location.href = '/';
}

// Play as guest
function playAsGuest() {
    currentUser = { id: 'guest', username: 'Guest Player' };
    redirectToGame();
}

// Login form handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showError('login', 'Please fill in all fields');
        return;
    }
    
    setLoading('login', true);
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token and user info
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showSuccess('login', 'Login successful! Redirecting...');
            setTimeout(redirectToGame, 1500);
        } else {
            showError('login', data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('login', 'Network error. Please try again.');
    } finally {
        setLoading('login', false);
    }
});

// Register form handler
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();
    
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    // Validation
    if (!username || !password) {
        showError('register', 'Please fill in all required fields');
        return;
    }
    
    if (password.length < 6) {
        showError('register', 'Password must be at least 6 characters long');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('register', 'Passwords do not match');
        return;
    }
    
    if (username.length < 3) {
        showError('register', 'Username must be at least 3 characters long');
        return;
    }
    
    setLoading('register', true);
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                username, 
                password, 
                email: email || null 
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token and user info
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showSuccess('register', 'Registration successful! Redirecting...');
            setTimeout(redirectToGame, 1500);
        } else {
            showError('register', data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError('register', 'Network error. Please try again.');
    } finally {
        setLoading('register', false);
    }
});

// Add some visual feedback for form interactions
document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.style.transform = 'scale(1.02)';
    });
    
    input.addEventListener('blur', () => {
        input.parentElement.style.transform = 'scale(1)';
    });
});

// Add enter key support for form switching
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const activeForm = document.querySelector('.auth-form[style*="display: block"]');
        if (activeForm) {
            const submitBtn = activeForm.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                submitBtn.click();
            }
        }
    }
}); 