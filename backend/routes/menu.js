const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const { data: items, error } = await supabase
      .from('menu_items')
      .select('*');
    
    if (error) throw error;
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single menu item
router.get('/:id', async (req, res) => {
  try {
    const { data: item, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error || !item) return res.status(404).json({ message: 'Menu item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
