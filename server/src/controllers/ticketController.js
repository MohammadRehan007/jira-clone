const Ticket = require('../models/Ticket');
const Project = require('../models/Project');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const mailService = require('../services/mailService');
const { deleteResource } = require('../config/cloudinary');

const getTickets = async (req, res, next) => {
  try {
    const { project, sprint, status, assignee, priority, type, search } = req.query;
    const filter = {};

    if (project) filter.project = project;

    if (sprint !== undefined) {
      if (sprint === 'backlog' || sprint === 'null' || sprint === '') {
        filter.sprint = null;
      } else {
        filter.sprint = sprint;
      }
    }

    if (status) filter.status = status;
    if (assignee) filter.assignee = assignee;
    if (priority) filter.priority = priority;
    if (type) filter.type = type;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { ticketKey: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tickets = await Ticket.find(filter)
      .populate('assignee', 'name email avatar role department')
      .populate('reporter', 'name email avatar role department')
      .populate('sprint', 'name status startDate endDate')
      .populate('project', 'name key')
      .sort({ createdAt: -1 })
      .lean();

    res.json(tickets);
  } catch (error) {
    next(error);
  }
};

const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('assignee', 'name email avatar role department')
      .populate('reporter', 'name email avatar role department')
      .populate('sprint', 'name status startDate endDate')
      .populate('project', 'name key');

    if (!ticket) {
      res.status(404);
      throw new Error('Ticket not found');
    }

    const activities = await ActivityLog.find({ ticket: ticket._id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ ticket, activities });
  } catch (error) {
    next(error);
  }
};

const createTicket = async (req, res, next) => {
  try {
    const { title, description, type, status, priority, project, sprint, assignee, storyPoints, dueDate, tags, attachments } = req.body;

    const projDoc = await Project.findById(project);
    if (!projDoc) {
      res.status(404);
      throw new Error('Project not found');
    }

    const ticketKey = `${projDoc.key}-${projDoc.ticketCounter}`;
    projDoc.ticketCounter += 1;
    await projDoc.save();

    const ticket = await Ticket.create({
      ticketKey,
      title,
      description: description || '',
      type: type || 'Task',
      status: status || 'To Do',
      priority: priority || 'Medium',
      project,
      sprint: sprint || null,
      assignee: assignee || null,
      reporter: req.user._id,
      storyPoints: storyPoints || 1,
      dueDate: dueDate || null,
      tags: tags || [],
      attachments: attachments || []
    });

    // Create Activity Log
    await ActivityLog.create({
      ticket: ticket._id,
      user: req.user._id,
      action: `Created ticket ${ticketKey}`
    });

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('assignee', 'name email avatar role department')
      .populate('reporter', 'name email avatar role department')
      .populate('sprint', 'name status')
      .populate('project', 'name key');

    // Trigger Mail Notification if assigned
    if (populatedTicket.assignee) {
      mailService.sendTicketAssignedEmail({
        ticket: populatedTicket,
        assignee: populatedTicket.assignee,
        reporter: req.user
      });
    }

    res.status(201).json(populatedTicket);
  } catch (error) {
    next(error);
  }
};

const updateTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      res.status(404);
      throw new Error('Ticket not found');
    }

    const oldAssigneeId = ticket.assignee ? ticket.assignee.toString() : null;
    const oldStatus = ticket.status;

    const fields = ['title', 'description', 'type', 'status', 'priority', 'sprint', 'assignee', 'storyPoints', 'dueDate', 'tags', 'attachments'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        ticket[field] = req.body[field];
      }
    });

    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('assignee', 'name email avatar role department')
      .populate('reporter', 'name email avatar role department')
      .populate('sprint', 'name status')
      .populate('project', 'name key');

    // Mail Trigger 1: Assignee Changed
    const newAssigneeId = updatedTicket.assignee ? updatedTicket.assignee._id.toString() : null;
    if (newAssigneeId && newAssigneeId !== oldAssigneeId) {
      mailService.sendTicketAssignedEmail({
        ticket: updatedTicket,
        assignee: updatedTicket.assignee,
        reporter: req.user
      });
      await ActivityLog.create({
        ticket: ticket._id,
        user: req.user._id,
        action: `Assigned ticket to ${updatedTicket.assignee.name}`
      });
    }

    // Mail Trigger 2: Status Changed
    if (oldStatus !== updatedTicket.status) {
      const recipients = [updatedTicket.reporter, updatedTicket.assignee].filter(Boolean);
      mailService.sendTicketStatusChangedEmail({
        ticket: updatedTicket,
        oldStatus,
        newStatus: updatedTicket.status,
        updatedBy: req.user,
        recipients
      });
      await ActivityLog.create({
        ticket: ticket._id,
        user: req.user._id,
        action: `Changed status from ${oldStatus} to ${updatedTicket.status}`
      });
    }

    res.json(updatedTicket);
  } catch (error) {
    next(error);
  }
};

const updateTicketStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      res.status(404);
      throw new Error('Ticket not found');
    }

    const oldStatus = ticket.status;
    ticket.status = status;
    await ticket.save();

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('assignee', 'name email avatar role department')
      .populate('reporter', 'name email avatar role department')
      .populate('project', 'name key');

    await ActivityLog.create({
      ticket: ticket._id,
      user: req.user._id,
      action: `Moved status from ${oldStatus} to ${status}`
    });

    // Send Email
    const recipients = [updatedTicket.reporter, updatedTicket.assignee].filter(Boolean);
    mailService.sendTicketStatusChangedEmail({
      ticket: updatedTicket,
      oldStatus,
      newStatus: status,
      updatedBy: req.user,
      recipients
    });

    res.json(updatedTicket);
  } catch (error) {
    next(error);
  }
};

const addTicketAttachment = async (req, res, next) => {
  try {
    const { attachment } = req.body;
    if (!attachment || !attachment.url) {
      res.status(400);
      throw new Error('Attachment details (url) are required');
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      res.status(404);
      throw new Error('Ticket not found');
    }

    ticket.attachments.push(attachment);
    await ticket.save();

    await ActivityLog.create({
      ticket: ticket._id,
      user: req.user._id,
      action: `Attached image: ${attachment.name || 'image'}`
    });

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('assignee', 'name email avatar role department')
      .populate('reporter', 'name email avatar role department')
      .populate('sprint', 'name status')
      .populate('project', 'name key');

    res.json(updatedTicket);
  } catch (error) {
    next(error);
  }
};

const removeTicketAttachment = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      res.status(404);
      throw new Error('Ticket not found');
    }

    const attIndex = ticket.attachments.findIndex(
      (a) => a._id.toString() === req.params.attachmentId
    );

    if (attIndex === -1) {
      res.status(404);
      throw new Error('Attachment not found');
    }

    const attachment = ticket.attachments[attIndex];
    if (attachment.publicId) {
      try {
        await deleteResource(attachment.publicId);
      } catch (err) {
        console.warn('[Cloudinary] Could not delete attachment:', err.message);
      }
    }

    const attName = attachment.name || 'image';
    ticket.attachments.splice(attIndex, 1);
    await ticket.save();

    await ActivityLog.create({
      ticket: ticket._id,
      user: req.user._id,
      action: `Removed attachment: ${attName}`
    });

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('assignee', 'name email avatar role department')
      .populate('reporter', 'name email avatar role department')
      .populate('sprint', 'name status')
      .populate('project', 'name key');

    res.json(updatedTicket);
  } catch (error) {
    next(error);
  }
};

const deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      res.status(404);
      throw new Error('Ticket not found');
    }

    // Clean up attached images on Cloudinary if any
    if (ticket.attachments && ticket.attachments.length > 0) {
      for (const att of ticket.attachments) {
        if (att.publicId) {
          try {
            await deleteResource(att.publicId);
          } catch (err) {
            console.warn('[Cloudinary] Failed to clean up asset on delete:', err.message);
          }
        }
      }
    }

    await ticket.deleteOne();
    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  updateTicketStatus,
  addTicketAttachment,
  removeTicketAttachment,
  deleteTicket
};
