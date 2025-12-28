
const API_URL = 'http://localhost:3001/api/v1';

async function verify() {
    try {
        const email = `apitest_${Date.now()}@test.com`;
        const password = 'Password123!';

        console.log(`1. Registering ${email}...`);
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'API Tester', email, password }),
        });
        const regData = await regRes.json();

        if (!regData.success) {
            throw new Error(`Registration failed: ${regData.message}`);
        }

        const token = regData.data.token;
        console.log('Token received.');

        console.log('2. Creating Task...');
        const taskRes = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: 'Node Test Task',
                description: 'Testing comments',
                priority: 'HIGH',
                status: 'TODO',
                dueDate: '2025-12-31T00:00:00Z'
            }),
        });
        const taskData = await taskRes.json();
        if (!taskData.success) throw new Error(`Task creation failed: ${taskData.message}`);
        const taskId = taskData.data.id;
        console.log(`Task Created: ${taskId}`);

        console.log('3. Adding Comment...');
        const commentRes = await fetch(`${API_URL}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                content: 'Hello form Node.js',
                taskId: taskId
            })
        });
        const commentData = await commentRes.json();
        if (!commentData.success) throw new Error(`Comment creation failed: ${commentData.message}`);
        const commentId = commentData.data.id;
        console.log(`Comment Created: ${commentId}`);

        console.log('4. Fetching Comments...');
        const listRes = await fetch(`${API_URL}/tasks/${taskId}/comments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const listData = await listRes.json();
        // listData.data should be array
        const found = listData.data.find(c => c.id === commentId);
        if (!found) throw new Error('Comment not found in list!');
        console.log('SUCCESS: Comment found.');

        console.log('5. Deleting Comment...');
        const delRes = await fetch(`${API_URL}/comments/${commentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const delData = await delRes.json();
        if (!delData.success) throw new Error('Delete failed');
        console.log('Comment deleted.');

        // Verify
        const verifyRes = await fetch(`${API_URL}/tasks/${taskId}/comments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const verifyData = await verifyRes.json();
        if (verifyData.data.find(c => c.id === commentId)) {
            throw new Error('Comment still exists after delete!');
        }
        console.log('SUCCESS: Comment gone.');

    } catch (err) {
        console.error('VERIFICATION FAILED:', err.message);
        process.exit(1);
    }
}

verify();
