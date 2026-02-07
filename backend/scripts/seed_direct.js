const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const connectDB = require('../config/db');

// Load env vars
dotenv.config();

const seedUsers = async () => {
    try {
        await connectDB();

        console.log('--- Seeding Default Users (Direct DB) ---');

        const users = [
            {
                name: 'Project Manager',
                email: 'manager@test.com',
                password: 'password123',
                role: 'Project Manager'
            }
        ];

        for (const user of users) {
            let existingUser = await User.findOne({ email: user.email });

            if (existingUser) {
                console.log(`Updating existing user: ${user.email}`);
                existingUser.password = user.password;
                existingUser.role = user.role;
                existingUser.name = user.name;
                await existingUser.save();
                console.log(`   [SUCCESS] Updated: ${user.email}`);
            } else {
                console.log(`Creating new user: ${user.email}`);
                await User.create(user);
                console.log(`   [SUCCESS] Created: ${user.email}`);
            }
        }

        console.log('--- Seeding Complete ---');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedUsers();
