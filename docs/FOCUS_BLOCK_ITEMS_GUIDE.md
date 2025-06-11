# How to Add Items to Focus Blocks

## Overview
The FocusNest app allows you to add specific tasks/items to your focus blocks to help you stay organized and track what you need to accomplish during each time block.

## Methods to Add Items to Focus Blocks

### 1. **Creating New Blocks with Tasks**

When creating a new time block, you can add up to 5 specific tasks:

#### Steps:
1. Tap the **"+"** button on the Today screen
2. Fill in the block title and time details
3. In the **Tasks** section, add your specific items:
   - Each task can be up to 100 characters
   - You can add up to 5 tasks per block
   - Use the **"+ Add another task"** button to add more tasks
   - Use the trash icon to remove unwanted tasks

#### Example Tasks:
```
• Review project requirements
• Design system architecture  
• Write unit tests
• Update documentation
• Code review for PR #123
```

### 2. **Quick Blocks with Default Tasks**

Quick blocks automatically include a default task:

#### Steps:
1. Tap **"Add Quick Block"** on Today screen
2. Choose duration (30min, 60min, or 90min)
3. The block is created with a default task: "Focus on current task"

### 3. **Editing Existing Blocks** (Future Feature)

Currently, the app shows an alert when you tap on existing blocks. This will be enhanced to allow:
- Adding new tasks to existing blocks
- Editing existing tasks
- Reordering tasks
- Marking tasks as complete

## Task Display in the App

### **Today Screen**
- Shows first 2 tasks under each time block
- Displays "+X more" if there are additional tasks
- Tasks appear as bullet points with "•" prefix

### **Focus Mode**
- All tasks for the active block are visible during focus sessions
- Tasks help you stay on track during deep work

### **Reflection Screen**
- Review completed tasks when reflecting on your focus sessions
- Rate how well you accomplished your planned tasks

## Best Practices for Adding Tasks

### **Be Specific**
❌ Bad: "Work on project"
✅ Good: "Implement user authentication API"

### **Make Tasks Actionable**
❌ Bad: "Think about design"
✅ Good: "Create wireframes for login screen"

### **Size Tasks Appropriately**
- For 30-minute blocks: 1-2 small tasks
- For 60-minute blocks: 2-3 medium tasks  
- For 90+ minute blocks: 3-5 tasks or 1 large task

### **Use Action Verbs**
- "Review", "Write", "Design", "Implement", "Test", "Research"
- "Call", "Email", "Update", "Create", "Fix", "Optimize"

## Task Management Features

### **Current Features**
- ✅ Add up to 5 tasks per block
- ✅ Remove tasks with trash icon
- ✅ Tasks display in time-ordered blocks
- ✅ Tasks visible during focus sessions
- ✅ Character limit (100 chars per task)

### **Planned Features**
- 🔄 Edit existing block tasks
- 🔄 Mark individual tasks as complete
- 🔄 Reorder tasks within a block
- 🔄 Task templates for common workflows
- 🔄 Task time estimates
- 🔄 Subtasks for complex items

## Technical Implementation

### **Data Structure**
```typescript
interface TimeBlockData {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  category: string;
  color: string;
  tasks: string[];        // Array of task strings
  isActive: boolean;
  isCompleted: boolean;
  progress?: number;
}
```

### **Storage**
- Tasks are stored as an array of strings in each time block
- Automatically saved to AsyncStorage
- Persists across app sessions
- Syncs across all screens

## Troubleshooting

### **Can't Add More Tasks**
- Maximum of 5 tasks per block
- Remove existing tasks to add new ones

### **Tasks Not Saving**
- Ensure you tap "Create Block" after adding tasks
- Check that tasks aren't empty (whitespace only)

### **Tasks Not Displaying**
- Tasks appear under the block title and category
- Only first 2 tasks shown on Today screen
- All tasks visible in Focus mode

## Examples of Well-Structured Focus Blocks

### **Morning Deep Work (2 hours)**
```
Title: "Frontend Development Sprint"
Tasks:
• Implement user profile component
• Add form validation logic  
• Write unit tests for new features
• Update component documentation
• Review and merge pending PRs
```

### **Admin Block (30 minutes)**
```
Title: "Daily Communications"
Tasks:
• Reply to client emails
• Update project status in Slack
• Schedule next week's meetings
```

### **Learning Block (90 minutes)**
```
Title: "React Native Study Session"
Tasks:
• Complete navigation tutorial
• Practice gesture handling
• Build sample animation
• Take notes on best practices
```

This system helps you stay focused and productive by breaking down your time blocks into specific, actionable items!