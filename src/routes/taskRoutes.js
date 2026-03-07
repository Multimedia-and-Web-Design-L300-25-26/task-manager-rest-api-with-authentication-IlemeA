import express from "express";
import Task from "../models/Task.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware
router.use(authMiddleware);

// POST /api/tasks
router.post("/", async (req, res) => {
  try {
    // - Create task
    // - Attach owner = req.user._id
    const { title, description, dueDate, priority } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    
    const task = new Task({
      title,
      description,
      dueDate,
      priority,
      owner: req.user._id
    });
    
    await task.save();
    
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/tasks
router.get("/", async (req, res) => {
  try {
    // - Return only tasks belonging to req.user
    // - Support pagination (page, limit)
    // - Support filtering by completed status (completed=true/false)
    // - Support sorting (sortBy: createdAt, dueDate, priority, sortOrder: asc/desc)
    
    const { 
      page = 1, 
      limit = 10, 
      completed, 
      sortBy = "createdAt", 
      sortOrder = "desc" 
    } = req.query;
    
    // Build filter object
    const filter = { owner: req.user._id };
    
    if (completed !== undefined) {
      filter.completed = completed === "true";
    }
    
    // Build sort object
    const sortOptions = {};
    const validSortFields = ["createdAt", "dueDate", "priority"];
    
    if (validSortFields.includes(sortBy)) {
      sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
    } else {
      sortOptions.createdAt = -1; // default sort
    }
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const tasks = await Task.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Task.countDocuments(filter);
    
    res.status(200).json({
      tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/tasks/:id - Get single task by ID
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    // Check if the user owns the task
    if (task.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view this task" });
    }
    
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/tasks/:id - Update entire task
router.put("/:id", async (req, res) => {
  try {
    const { title, description, completed, dueDate, priority } = req.body;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    // Check if the user owns the task
    if (task.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this task" });
    }
    
    // Validate priority if provided
    if (priority && !["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({ message: "Priority must be low, medium, or high" });
    }
    
    // Update fields
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (priority) task.priority = priority;
    
    await task.save();
    
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/tasks/:id - Partial update (toggle completed)
router.patch("/:id", async (req, res) => {
  try {
    const { completed } = req.body;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    // Check if the user owns the task
    if (task.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this task" });
    }
    
    // Only update completed status
    if (completed !== undefined) {
      task.completed = completed;
    }
    
    await task.save();
    
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req, res) => {
  try {
    // - Check ownership
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    // Check if the user owns the task
    if (task.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this task" });
    }
    
    // - Delete task
    await Task.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
