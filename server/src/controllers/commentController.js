const Comment = require('../models/Comment');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { parseMentions } = require('../utils/mentionParser');
const mailService = require('../services/mailService');

const getCommentsByTicket = async (req, res, next) => {
  try {
    const { ticket } = req.query;
    if (!ticket) {
      res.status(400);
      throw new Error('Ticket ID is required');
    }

    const comments = await Comment.find({ ticket })
      .populate('author', 'name email avatar role department')
      .populate('mentions', 'name email avatar')
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    next(error);
  }
};

const createComment = async (req, res, next) => {
  try {
    const { ticketId, content } = req.body;

    const ticket = await Ticket.findById(ticketId)
      .populate('assignee', 'name email')
      .populate('reporter', 'name email');

    if (!ticket) {
      res.status(404);
      throw new Error('Ticket not found');
    }

    // Extract @mentions
    const mentionUserIds = await parseMentions(content);

    const comment = await Comment.create({
      ticket: ticket._id,
      author: req.user._id,
      content,
      mentions: mentionUserIds
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name email avatar role department')
      .populate('mentions', 'name email avatar');

    // Mail Trigger 1: General comment recipients (Reporter & Assignee, excluding comment author)
    const rawRecipients = [ticket.reporter, ticket.assignee].filter(Boolean);
    const recipients = rawRecipients.filter(r => r._id.toString() !== req.user._id.toString());

    mailService.sendCommentAddedEmail({
      ticket,
      comment: populatedComment,
      author: req.user,
      recipients
    });

    // Mail Trigger 2: Mentioned Users email trigger!
    if (populatedComment.mentions && populatedComment.mentions.length > 0) {
      populatedComment.mentions.forEach(mentionedUser => {
        mailService.sendUserMentionedEmail({
          ticket,
          comment: populatedComment,
          author: req.user,
          mentionedUser
        });
      });
    }

    res.status(201).json(populatedComment);
  } catch (error) {
    next(error);
  }
};

module.exports = { getCommentsByTicket, createComment };
