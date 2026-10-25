const express = require('express');
const router = express.Router();
const {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  updateTicketStatus,
  addTicketAttachment,
  removeTicketAttachment,
  deleteTicket
} = require('../controllers/ticketController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', protect, getTickets);
router.get('/:id', protect, getTicketById);
router.post('/', protect, createTicket);
router.put('/:id', protect, updateTicket);
router.put('/:id/status', protect, updateTicketStatus);
router.post('/:id/attachments', protect, addTicketAttachment);
router.delete('/:id/attachments/:attachmentId', protect, removeTicketAttachment);
router.delete('/:id', protect, authorize('Admin', 'ProjectLead'), deleteTicket);

module.exports = router;
