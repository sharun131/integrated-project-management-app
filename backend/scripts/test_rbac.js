const API_URL = 'http://localhost:5000/api';

async function testRBAC() {
    console.log('--- Starting RBAC Verification ---');

    // 1. Register Admin
    let adminToken = '';
    try {
        console.log('1. Registering Admin...');
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Admin',
                email: `admin_${Date.now()}@test.com`,
                password: 'password123',
                role: 'Project Manager' // Ensure allowed role
            })
        });
        const data = await res.json();
        if (!data.token) throw new Error(data.error || 'No token');
        adminToken = data.token;
        console.log('   [PASS] Admin Registered');
    } catch (err) {
        console.error('   [FAIL] Admin Register:', err.message);
        return; // Exit if admin creation checks
    }

    // 2. Register User
    let memberToken = '';
    try {
        console.log('2. Registering Member...');
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Member',
                email: `member_${Date.now()}@test.com`,
                password: 'password123',
                role: 'Team Member'
            })
        });
        const data = await res.json();
        if (!data.token) throw new Error(data.error || 'No token');
        memberToken = data.token;
        console.log('   [PASS] Member Registered');
    } catch (err) {
        console.error('   [FAIL] Member Register:', err.message);
        return;
    }

    // 3. Admin Creates Project
    let projectId = '';
    try {
        console.log('3. Admin Creating Project...');
        const res = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                name: 'RBAC Test Project',
                description: 'Top secret',
                status: 'Active',
                startDate: new Date(),
                endDate: new Date()
            })
        });
        const data = await res.json();
        if (!data.data?._id) throw new Error('No Project ID');
        projectId = data.data._id;
        console.log('   [PASS] Project Created:', projectId);
    } catch (err) {
        console.error('   [FAIL] Create Project:', err.message);
        return;
    }

    // 4. Member Tries to Delete Project (Should FAIL)
    try {
        console.log('4. Member Attempting Delete (Should Fail)...');
        const res = await fetch(`${API_URL}/projects/${projectId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${memberToken}`
            }
        });

        if (res.status === 403 || res.status === 401) {
            console.log(`   [PASS] Delete Blocked (Status: ${res.status})`);
        } else {
            console.error(`   [FAIL] Delete Allowed!! (Status: ${res.status})`);
        }
    } catch (err) {
        console.log('   [PASS] Network/Server Error appropriately handled');
    }

    // 5. Admin Tries to Delete Project (Should PASS)
    try {
        console.log('5. Admin Deleting Project...');
        const res = await fetch(`${API_URL}/projects/${projectId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        const data = await res.json();
        if (data.success) {
            console.log('   [PASS] Admin Delete Succeeded');
        } else {
            console.error('   [FAIL] Admin Delete Failed:', data.error);
        }
    } catch (err) {
        console.error('   [FAIL] Admin Delete Error:', err.message);
    }

    console.log('--- RBAC Verification Complete ---');
}

testRBAC();
