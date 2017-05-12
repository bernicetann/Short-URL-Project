//Required
var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const helpers = require('./helpers/helperfunctions');
const generateRandomString = helpers.generatedRand;

//Let's us use ejs
app.set("view engine", "ejs")

//Middlewares
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use((req, res, next) => {
  res.locals.username = req.cookies.username;
  next();
});

//Databases
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let users = {
  user1RandomID: {
    id: "user1RandomID",
    email: "user1@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Lists urls/homepage
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
                       // username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

//Gives you a random generated 6 alphanumeric variable for a long URL
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  var generateNumbers = generateRandomString();
  urlDatabase[generateNumbers] = req.body.longURL;
  res.redirect(`urls/${generateNumbers}`);
});

//Routes to shortURL
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       longURL: urlDatabase[req.params.id],
                       username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

//Routes to the longURL using shortURL
app.get("/u/:shortURL", (req, res) => {
  console.log("getting URL for ", req.params.shortURL)
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//Delete a URL resource
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
})

//Update URLs
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id
  urlDatabase[shortURL] = req.body.updatedURL;
  res.redirect('/urls');
})

//Login
app.post("/login", (req, res) => {
  res.cookie('user_id', req.body.username);
  for(var user in users) {
    return
  }
  //Task 9: if user does not match email respond with 403
  //if matched, compare email with password
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  res.render('urls_login');
});

//Logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//Register
app.get("/register", (req, res) => {

  res.render('urls_register');
});

app.post("/register", (req, res) => {
  let newId = req.body.username;
  let newEmail = req.body.email;
  let newPassword = req.body.password;
  users[newId] = { id: newId,
                   email: newEmail,
                   password: newPassword };

  res.cookie('user_id', newId);
  const emailDoesExist = emailExists(newEmail);

  if (!newEmail || !newPassword) {
    res.status(400);
    res.send("STATUS 400: Username/Password is empty");
  } else if (emailDoesExist) {
    res.status(400);
    res.send("STATUS 400: This e-mail already exists");
  }
  res.redirect('/urls');
});

// const emailExists = newEmail => email === newEmail;
const emailExists = function(newEmail) {
  for(var user in users) {
    if(users[user].email === newEmail) {
    return true;
    }
  }
  return false;
}

var userPasswordArray = function(users) {
  const registeredPasswords = [];
  for(var user in users) {
    registeredPasswords.push(users[user].password);
  }
  return registeredPasswords;
};


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// TODO : there's some crazy bug when I change the url to 'lighthouselabs.ca' and then try the redirect link








