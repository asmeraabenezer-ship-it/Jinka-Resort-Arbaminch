const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Create order
router.post('/', async (req, res) => {
  try {
    const { user, items, totalAmount, deliveryAddress } = req.body;
    
    // 1. Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{ 
        user_id: user, 
        total_amount: totalAmount, 
        delivery_address: deliveryAddress 
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Insert order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      menu_item_id: item.menuItem,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user orders
router.get('/user/:userId', async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*, menu_items(*))')
      .eq('user_id', req.params.userId);
    
    if (error) throw error;
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
