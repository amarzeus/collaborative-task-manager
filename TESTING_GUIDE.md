# Manual Testing Guide - Real-time Sync & Undo

## Quick Test Checklist

### Setup
- [ ] Open `http://localhost:5173` in Chrome
- [ ] Open `http://localhost:5173` in Firefox (or another Chrome window)
- [ ] Login as same user in both windows
- [ ] Open browser console (F12) to see debug logs

---

## Test 1: Real-time Task Creation
**Window 1:**
1. Click "New Task" button
2. Create task: "Real-time Sync Test"
3. Submit

**Window 2:**
- ✅ Task should appear instantly in task list
- ✅ Console shows: `📡 Real-time: Task created`

---

## Test 2: Real-time Task Update
**Window 1:**
1. Click on a task to open details
2. Click "Edit" button
3. Change title to "Updated Title"
4. Save

**Window 2 (on same task detail page):**
- ✅ Title updates instantly
- ✅ Toast notification: "Task updated by another user"
- ✅ Console shows: `📡 Real-time: Task updated`

---

## Test 3: Real-time Task Deletion
**Window 1:**
1. Delete a task

**Window 2:**
- ✅ Task disappears from list instantly
- ✅ If on detail page: Shows warning + navigates to /tasks
- ✅ Console shows: `📡 Real-time: Task deleted`

---

## Test 4: Comment Undo
**Single Window:**
1. Go to task details
2. Add a comment
3. Click delete (trash icon)
4. **Verify:** Comment disappears
5. **Verify:** Toast appears: "Comment deleted" with "Undo" button
6. Click "Undo" within 5 seconds
7. **Verify:** Comment reappears

**Let it expire:**
1. Delete another comment
2. Wait 5+ seconds without clicking Undo
3. **Verify:** Comment permanently deleted
4. **Verify:** Console shows: `✅ Comment permanently deleted`

---

## Test 5: Subtask Undo
**Single Window:**
1. Go to task details
2. Add a subtask
3. Click X to delete subtask
4. **Verify:** Subtask disappears
5. **Verify:** Toast appears with subtask preview + "Undo" button
6. Click "Undo"
7. **Verify:** Subtask restored

---

## Test 6: Task Undo
**Single Window:**
1. Go to Tasks page
2. Click delete on a task
3. Confirm deletion
4. **Verify:** Modal closes
5. **Verify:** Toast appears: "Task \"...\" deleted" with "Undo"
6. Click "Undo" within 5 seconds
7. **Verify:** Task still visible in list

---

## Test 7: Kanban Real-time
**Window 1:**
1. Switch to Kanban view
2. Drag a task from TODO to IN_PROGRESS

**Window 2 (Kanban view):**
- ✅ Task moves to new column instantly
- ✅ Console shows: `📡 Real-time: Task updated`

---

## Test 8: Dashboard Real-time
**Window 1:**
1. Complete a task (change status to COMPLETED)

**Window 2 (Dashboard):**
- ✅ Stats update (Completed count increases)
- ✅ Productivity ring updates
- ✅ Charts update

---

## Expected Console Logs

### Connection
```
✅ Connected to Socket.io server at http://localhost:3001
```

### Events
```
📡 Socket event: task:created [Object]
📡 Real-time: Task created abc-123
📡 Real-time: Task updated abc-123
📡 Real-time: Task deleted abc-123
```

### Undo
```
↩️ Comment deletion undone
✅ Comment permanently deleted: abc-123
↩️ Subtask deletion undone
✅ Subtask permanently deleted: Task text
```

---

## Troubleshooting

### Socket.io not connecting
- Check backend is running: `npm run dev` in backend folder
- Check console for connection errors
- Verify `VITE_SOCKET_URL` in frontend `.env`

### Real-time not working
- Check console for `📡` events
- Verify both windows logged in as same user
- Refresh both windows
- Check backend console for Socket.io events

### Undo not working
- Check toast appears
- Verify 5-second timer
- Check console for undo logs
- Ensure ToastProvider is loaded

---

## Success Criteria

✅ All real-time events appear in both windows
✅ Undo toasts appear for all deletions
✅ Undo restores items within 5 seconds
✅ Permanent deletion after 5 seconds
✅ No duplicate items
✅ Console shows all debug logs
