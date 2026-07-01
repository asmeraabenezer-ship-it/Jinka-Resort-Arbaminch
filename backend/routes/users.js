const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email, password }])
      .select()
      .single();

    if (error) throw error;
    
    const user = data;
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: user.id, name, email, role: user.role } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Attempting login with email:', email);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('Supabase query error:', error);
    }
    console.log('Supabase retrieved user data:', data);
    if (data) {
      console.log('Comparison:', { received: password, expected: data.password, match: data.password === password });
    }

    if (error || !data || data.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = data;
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

module.exports = router;
