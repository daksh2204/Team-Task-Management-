import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Project from './models/Project.js';
import Task from './models/Task.js';

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding');

    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();

    // 1. Create Users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'password123',
      role: 'Admin',
    });

    const member = await User.create({
      name: 'Member User',
      email: 'member@test.com',
      password: 'password123',
      role: 'Member',
    });

    // 2. Create Project
    const project = await Project.create({
      name: 'Alpha Launch',
      admin: admin._id,
      members: [admin._id, member._id],
    });

    // Update Users with project
    await User.findByIdAndUpdate(admin._id, { $push: { projects: project._id } });
    await User.findByIdAndUpdate(member._id, { $push: { projects: project._id } });

    // 3. Create Tasks
    const tasks = await Task.insertMany([
      {
        title: 'Design UI Mockups',
        description: 'Create high-fidelity mockups for the dashboard.',
        dueDate: new Date(Date.now() + 86400000 * 2),
        priority: 'High',
        status: 'To Do',
        assignedTo: member._id,
        project: project._id,
      },
      {
        title: 'Setup Database Schema',
        description: 'Define Mongoose models and relations.',
        dueDate: new Date(Date.now() + 86400000 * 5),
        priority: 'Medium',
        status: 'In Progress',
        assignedTo: admin._id,
        project: project._id,
      },
      {
        title: 'Initialize Repository',
        description: 'Set up Vite and Express backend.',
        dueDate: new Date(Date.now() - 86400000), // Overdue
        priority: 'Low',
        status: 'Done',
        assignedTo: admin._id,
        project: project._id,
      }
    ]);

    // Update project with tasks
    await Project.findByIdAndUpdate(project._id, { $push: { tasks: { $each: tasks.map(t => t._id) } } });

    console.log('Mock Data Seeded Successfully!');
    console.log('Login credentials:');
    console.log('Admin: admin@test.com / password123');
    console.log('Member: member@test.com / password123');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();
