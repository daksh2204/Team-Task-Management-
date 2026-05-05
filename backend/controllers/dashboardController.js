import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

export const getDashboardMetrics = async (req, res) => {
  try {
    let taskQuery = {};
    if (req.user.role === 'Member') {
      taskQuery.assignedTo = req.user._id;
    }

    const totalTasks = await Task.countDocuments(taskQuery);
    
    const tasksByStatus = await Task.aggregate([
      { $match: taskQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const overdueTasks = await Task.countDocuments({
      ...taskQuery,
      dueDate: { $lt: new Date() },
      status: { $ne: 'Done' }
    });

    let tasksPerUser = [];
    if (req.user.role === 'Admin') {
      tasksPerUser = await Task.aggregate([
        { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        { $project: { name: '$user.name', count: 1 } }
      ]);
    }

    res.json({
      totalTasks,
      tasksByStatus,
      overdueTasks,
      tasksPerUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
