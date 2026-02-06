const API_URL = 'http://localhost:5000/api';

async function seedUsers() {
    console.log('--- Seeding Default Users ---');

    const users = [
        {
            name: 'Admin User',
            email: 'admin@test.com',
            password: 'password123',
            role: 'Super Admin'
        },
        {
            name: 'Project Manager',
            email: 'manager@test.com',
            password: 'password123',
            role: 'Project Manager'
        },
        {
            name: 'Team Member',
            email: 'member@test.com',
            password: 'password123',
            role: 'Team Member'
        }
    ];

    for (const user of users) {
        try {
            console.log(`Registering ${user.email}...`);
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });

            const data = await res.json();

            if (res.ok) {
                console.log(`   [SUCCESS] Created: ${user.email}`);
            } else {
                if (data.error && data.error.includes('duplicate')) {
                    console.log(`   [INFO] User already exists: ${user.email}`);
                } else {
                    console.error(`   [FAIL] ${data.error || 'Unknown error'}`);
                }
            }
        } catch (err) {
            console.error(`   [ERROR] Failed to connect: ${err.message}`);
        }
    }
    console.log('--- Seeding Complete ---');
}

seedUsers();
