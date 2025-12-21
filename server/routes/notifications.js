const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authenticateToken } = require('../middleware/auth');

// Get user's notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.getUserNotifications(req.user.id);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get unread count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    await Notification.markAsRead(req.params.id, req.user.id);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all as read
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    await Notification.markAllAsRead(req.user.id);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
