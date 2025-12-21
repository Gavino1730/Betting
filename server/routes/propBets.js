const express = require('express');
const router = express.Router();
const PropBet = require('../models/PropBet');
const { authenticateToken } = require('../middleware/auth');

// Get all active prop bets (public)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const propBets = await PropBet.getAll();
    res.json(propBets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single prop bet (public)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const propBet = await PropBet.getById(req.params.id);
    if (!propBet) {
      return res.status(404).json({ error: 'Prop bet not found' });
    }
    res.json(propBet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create prop bet (admin only)
router.post('/', authenticateToken, async (req, res) => {
  const user = req.user;
  if (!user.is_admin) {
    return res.status(403).json({ error: 'Only admins can create prop bets' });
  }

  const { title, description, teamType, yesOdds, noOdds, expiresAt } = req.body;

  // Validate required fields
  if (!title || !yesOdds || !noOdds) {
    return res.status(400).json({ error: 'Missing required fields: title, yesOdds, noOdds' });
  }

  try {
    const result = await PropBet.create({
      title,
      description,
      teamType: teamType || 'General',
      yesOdds: parseFloat(yesOdds),
      noOdds: parseFloat(noOdds),
      expiresAt
    });

    res.status(201).json({
      message: 'Prop bet created successfully',
      propBetId: result.id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update prop bet status/outcome (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  const user = req.user;
  if (!user.is_admin) {
    return res.status(403).json({ error: 'Only admins can update prop bets' });
  }

  const { status, outcome } = req.body;

  try {
    await PropBet.updateStatus(req.params.id, status, outcome);
    res.json({ message: 'Prop bet updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete prop bet (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  const user = req.user;
  if (!user.is_admin) {
    return res.status(403).json({ error: 'Only admins can delete prop bets' });
  }

  try {
    await PropBet.delete(req.params.id);
    res.json({ message: 'Prop bet deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
