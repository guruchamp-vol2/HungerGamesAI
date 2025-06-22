const bcrypt = require('bcryptjs');
const { initializeDatabase, userDB } = require('./database');

async function debugAuth() {
    try {
        console.log('Initializing database...');
        await initializeDatabase();
        
        console.log('\n=== Testing User Creation ===');
        const testUsername = 'Dev';
        const testPassword = 'IAmDev$$$!@#';
        
        // Check if user already exists
        const existingUser = await userDB.getUserByUsername(testUsername);
        if (existingUser) {
            console.log(`User '${testUsername}' already exists in database`);
            console.log('User ID:', existingUser.id);
            console.log('Password hash:', existingUser.password_hash);
            
            // Test password verification
            const isValid = await bcrypt.compare(testPassword, existingUser.password_hash);
            console.log('Password verification test:', isValid ? 'PASS' : 'FAIL');
            
            // Test with different password
            const isInvalid = await bcrypt.compare('wrongpassword', existingUser.password_hash);
            console.log('Wrong password test:', isInvalid ? 'FAIL' : 'PASS');
            
            // Let's create a new hash with the correct password to see if it matches
            const newHash = await bcrypt.hash(testPassword, 10);
            console.log('New hash for correct password:', newHash);
            console.log('Hash comparison:', existingUser.password_hash === newHash ? 'MATCH' : 'NO MATCH');
            
        } else {
            console.log(`User '${testUsername}' does not exist, creating...`);
            
            // Create new user
            const passwordHash = await bcrypt.hash(testPassword, 10);
            const newUser = await userDB.createUser(testUsername, passwordHash, 'dev@test.com');
            console.log('Created user:', newUser);
            
            // Test login
            const user = await userDB.getUserByUsername(testUsername);
            const validPassword = await bcrypt.compare(testPassword, user.password_hash);
            console.log('Login test:', validPassword ? 'PASS' : 'FAIL');
        }
        
        console.log('\n=== All Users in Database ===');
        // Note: This would require adding a getAllUsers function to database.js
        
    } catch (error) {
        console.error('Debug error:', error);
    }
}

debugAuth(); 