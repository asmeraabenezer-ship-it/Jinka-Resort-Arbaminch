const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('*');
    
    if (error) throw error;
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single room
router.get('/:id', async (req, res) => {
  try {
    const { data: room, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error || !room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
