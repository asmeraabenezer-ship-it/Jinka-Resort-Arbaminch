const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Middleware to check admin (simplified for demo)
const checkAdmin = (req, res, next) => {
  // In production, verify JWT and check user.role === 'admin'
  next();
};

// Helper to record logs
async function recordLog(action, target, details, adminId = null) {
  try {
    await supabase.from('logs').insert([{ action, target, details, admin_id: adminId }]);
  } catch (err) { console.error('Log error:', err); }
}

// Admin Routes for Rooms
router.post('/rooms', checkAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .insert([req.body])
      .select()
      .single();
    
    if (error) throw error;
    await recordLog('CREATE', 'ROOM', `Added room: ${data.title}`);
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/rooms/:id', checkAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    await recordLog('UPDATE', 'ROOM', `Updated room: ${data.title}`);
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/rooms/:id', checkAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    await recordLog('DELETE', 'ROOM', `Deleted room ID: ${req.params.id}`);
    res.json({ message: 'Room deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin Routes for Bookings
router.get('/bookings', checkAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, user:users(*), room:rooms(*)');
    
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/bookings/:id', checkAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: req.body.status })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    await recordLog('UPDATE', 'BOOKING', `Updated booking status: ${req.body.status}`);
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin Routes for Menu
router.post('/menu', checkAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .insert([req.body])
      .select()
      .single();
    
    if (error) throw error;
    await recordLog('CREATE', 'MENU', `Added menu item: ${data.name}`);
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/menu/:id', checkAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    await recordLog('UPDATE', 'MENU', `Updated menu item: ${data.name}`);
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/menu/:id', checkAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    await recordLog('DELETE', 'MENU', `Deleted menu item ID: ${req.params.id}`);
    res.json({ message: 'Menu item deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin Routes for Orders
router.get('/orders', checkAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, user:users(*), order_items(*, menu_items(*))');
    
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/orders/:id', checkAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: req.body.status })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    await recordLog('UPDATE', 'ORDER', `Updated order status: ${req.body.status}`);
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin Routes for User Management
router.get('/users', checkAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/users', checkAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([req.body])
      .select()
      .single();
    
    if (error) throw error;
    await recordLog('CREATE', 'USER', `Created authority user: ${data.email}`);
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/users/:id', checkAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    await recordLog('DELETE', 'USER', `Deleted user ID: ${req.params.id}`);
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Route to get logs
router.get('/logs', checkAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('logs')
      .select('*, user:users(name)')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
