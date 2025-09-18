const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(bodyParser.json());

const supabaseUrl = 'https://vjidfgmqbdlkknpxozvf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqaWRmZ21xYmRsa2tucHhvenZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMzA2NDQsImV4cCI6MjA3MzgwNjY0NH0.gMDjBn2x70X5rZ0OJpvZ8tObdJBqLiIy4oJxXPqUjes';
const supabase = createClient(supabaseUrl, supabaseKey);

const cors = require('cors');
app.use(cors());

app.post('/signup', async (req, res) => {
  const { email } = req.body;
  const { data, error } = await supabase
    .from('users')
    .insert([{ email }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Email saved successfully!' });
});

app.listen(3000, () => console.log('Backend running on port 3000'));
