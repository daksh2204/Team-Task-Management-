import Project from '../models/Project.js';
import User from '../models/User.js';

export const createProject = async (req, res) => {
  try {
    const { name } = req.body;
    const project = await Project.create({ name, admin: req.user._id, members: [req.user._id] });

    await User.findByIdAndUpdate(req.user._id, { $push: { projects: project._id } });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    // Both Admin and Member can see projects they belong to
    let query = {};
    if (req.user.role === 'Admin') {
      query = { admin: req.user._id };
    } else {
      query = { members: req.user._id };
    }
    const projects = await Project.find(query).populate('members', 'name email').populate('admin', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admins can add members' });
    }

    if (!project.members.includes(userId)) {
      project.members.push(userId);
      await project.save();
      await User.findByIdAndUpdate(userId, { $push: { projects: project._id } });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admins can remove members' });
    }

    project.members = project.members.filter(m => m.toString() !== userId);
    await project.save();
    await User.findByIdAndUpdate(userId, { $pull: { projects: project._id } });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
