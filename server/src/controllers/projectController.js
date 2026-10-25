const Project = require('../models/Project');

const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({})
      .populate('lead', 'name email avatar role')
      .populate('members', 'name email avatar role department');
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('lead', 'name email avatar role')
      .populate('members', 'name email avatar role department');
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const { name, key, description, members } = req.body;
    
    const keyExists = await Project.findOne({ key: key.toUpperCase() });
    if (keyExists) {
      res.status(400);
      throw new Error(`Project key '${key.toUpperCase()}' is already taken`);
    }

    const memberIds = members || [];
    if (!memberIds.includes(req.user._id.toString())) {
      memberIds.push(req.user._id.toString());
    }

    const project = await Project.create({
      name,
      key: key.toUpperCase(),
      description: description || '',
      lead: req.user._id,
      members: memberIds,
      ticketCounter: 100
    });

    const populated = await Project.findById(project._id)
      .populate('lead', 'name email avatar role')
      .populate('members', 'name email avatar role department');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { name, description, members } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (members) project.members = members;

    await project.save();
    
    const updated = await Project.findById(project._id)
      .populate('lead', 'name email avatar role')
      .populate('members', 'name email avatar role department');

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

module.exports = { getProjects, getProjectById, createProject, updateProject };
