import Task from '../models/Task.js';
import Project from '../models/Project.js';

export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, assignedTo, project } = req.body;
    
    // Ensure the project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) return res.status(404).json({ message: 'Project not found' });

    // Only Admin can create tasks (requirement check)
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only Admins can create tasks' });
    }

    const task = await Task.create({
      title, description, dueDate, priority, status, assignedTo, project
    });

    await Project.findByIdAndUpdate(project, { $push: { tasks: task._id } });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { projectId } = req.query; // optional filter
    let query = {};

    if (projectId) {
      query.project = projectId;
    }

    // Role-based filtering
    if (req.user.role === 'Member') {
      query.assignedTo = req.user._id;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('project', 'name');

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role === 'Member' && task.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Members can only update their assigned tasks' });
    }

    // For Members, maybe they should only be able to update specific fields like status
    // Admin can update anything.
    if (req.user.role === 'Admin') {
      Object.assign(task, req.body);
    } else {
      // Member specific updates (e.g., status)
      if (req.body.status) task.status = req.body.status;
      if (req.body.description) task.description = req.body.description; // optionally
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only Admins can delete tasks' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await task.deleteOne();
    await Project.findByIdAndUpdate(task.project, { $pull: { tasks: task._id } });

    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
