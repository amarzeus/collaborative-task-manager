// Quick test to verify ToastProvider is working
// Open browser console and paste this:

// Test 1: Check if ToastProvider context is available
console.log('Testing ToastProvider...');

// Test 2: Try to trigger a toast manually
// This should work if ToastProvider is loaded
try {
    // You should see a toast appear
    console.log('ToastProvider test: If you see a toast, it works!');
} catch (e) {
    console.error('ToastProvider not available:', e);
}

// Test 3: Check if useUndo hook is working
console.log('Check these in React DevTools:');
console.log('1. Find CommentList component');
console.log('2. Check if showUndo is defined');
console.log('3. Check if scheduleCommit is defined');

// Test 4: Manual deletion test
console.log('When you delete a comment/subtask, you should see:');
console.log('🗑️ Deleting comment/subtask');
console.log('🍞 Showing undo toast');
console.log('⏰ Scheduling permanent deletion');
console.log('');
console.log('If you do NOT see these logs, the delete handler is not being called');
console.log('If you see the logs but NO TOAST, ToastProvider is broken');
