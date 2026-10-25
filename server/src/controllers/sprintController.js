const Sprint = require('../models/Sprint');
const Ticket = require('../models/Ticket');

const getSprintsByProject = async (req, res, next) => {
  try {
    const { project } = req.query;
    if (!project) {
      res.status(400);
      throw new Error('Project ID is required in query params');
    }

    const sprints = await Sprint.find({ project }).sort({ createdAt: -1 });
    res.json(sprints);
  } catch (error) {
    next(error);
  }
};

const createSprint = async (req, res, next) => {
  try {
    const { name, goal, project, durationWeeks, startDate, endDate } = req.body;

    let start = startDate ? new Date(startDate) : new Date();
    let end = endDate ? new Date(endDate) : new Date();

    if (!endDate && durationWeeks) {
      end.setDate(start.getDate() + (parseInt(durationWeeks) * 7));
    }

    const sprint = await Sprint.create({
      name,
      goal: goal || '',
      project,
      startDate: start,
      endDate: end,
      status: 'Planned'
    });

    res.status(201).json(sprint);
  } catch (error) {
    next(error);
  }
};

const updateSprintStatus = async (req, res, next) => {
  try {
    const { status, rolloverOption } = req.body; // status: 'Active' or 'Completed'
    const sprint = await Sprint.findById(req.params.id);

    if (!sprint) {
      res.status(404);
      throw new Error('Sprint not found');
    }

    if (status === 'Active') {
      // Deactivate any currently active sprint in the same project first
      await Sprint.updateMany(
        { project: sprint.project, status: 'Active' },
        { status: 'Completed' }
      );
      sprint.status = 'Active';
    } else if (status === 'Completed') {
      sprint.status = 'Completed';
      
      // Handle unfinished tickets if specified
      if (rolloverOption === 'backlog') {
        await Ticket.updateMany(
          { sprint: sprint._id, status: { $ne: 'Done' } },
          { sprint: null }
        );
      }
    }

    await sprint.save();
    res.json(sprint);
  } catch (error) {
    next(error);
  }
};

module.exports = { getSprintsByProject, createSprint, updateSprintStatus };
