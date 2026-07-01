const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Create booking
router.post('/', async (req, res) => {
  try {
    const { user, room, checkIn, checkOut, totalPrice } = req.body;
    const { data, error } = await supabase
      .from('bookings')
      .insert([{ 
        user_id: user, 
        room_id: room, 
        check_in: checkIn, 
        check_out: checkOut, 
        total_price: totalPrice 
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user bookings
router.get('/user/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, room:rooms(*)')
      .eq('user_id', req.params.userId);
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
