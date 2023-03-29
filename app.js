const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const usersData = fs.readFileSync('users.json');
const users = JSON.parse(usersData);

app.get('/', (req, res) => {
  res.render('login', { errorMessage: '' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Read the current users from the JSON file
  

  // Check if the username exists in the list of users
  const user = users.find(user => user.username === username);
  if (!user) {
    res.render('login', { errorMessage: 'Invalid username' });
    return;
  }

  // Check if the provided password matches the stored password
  if (user.password !== password) {
    res.render('login', { errorMessage: 'Incorrect password' });
    return;
  }

  res.redirect('/dashboard');
});

app.get('/signup', (req, res) => {
  res.render('signup', { errorMessage: '' });
});

app.post('/signup', (req, res) => {
  const { username, password } = req.body;

  // Check if the users.json file exists
  const usersFile = path.join(__dirname, 'users.json');
  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, '[]');
  }

  // Read the current users from the JSON file
  const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));

  // Check if the username already exists in the file
  if (users.find(user => user.username === username)) {
    res.render('signup', { errorMessage: 'Username already exists' });
    return;
  }

  // Add the new user to the list of users
  users.push({ username, password });

  // Write the updated list of users back to the JSON file
  fs.writeFileSync(usersFile, JSON.stringify(users));

  res.redirect('/dashboard');
});


app.get('/forgot-password', (req, res) => {
  res.render('forgot-password', { errorMessage: '' });
});


app.post('/forgot-password', (req, res) => {
  const username = req.body.username;

  const user = users.find(user => user.username === username);
  if (!user) {
    res.render('forgot-password', { errorMessage: 'Invalid username' });
  } else {
    res.render('reset-password');
  }
});

app.get('/reset-password', (req, res) => {
  const username = req.query.username;
  res.render('reset-password', { username });
});

app.post('/reset-password', (req, res) => {
  const username = req.query.username;
  console.log(username);
  const newPassword = req.body.newPassword;
  const confirmPassword = req.body.confirmPassword;

  if (newPassword !== confirmPassword) {
    res.render('reset-password', { errorMessage: 'Passwords do not match' });
    return;
  }

  const user = users.find(user => user.username === username);

  user.password = newPassword;

  fs.writeFile(usersFile, JSON.stringify(users, null, 2), (err) => {
    if (err) throw err;
    res.render('reset-password-success');
  });
});


app.get('/forgot-password-success', (req, res) => {
  res.render('forgot-password-success');
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

app.listen(3000, () => {
  console.log('Server started on port 3000.');
});
