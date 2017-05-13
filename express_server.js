//Required
var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const helpers = require('./helpers/helperfunctions');
const generateRandomString = helpers.generatedRand;
const bcrypt = require('bcrypt');

//Let's us use ejs
app.set("view engine", "ejs");

//Middlewares
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));
app.use((req, res, next) => {
  res.locals.user = users[req.session.user_id];
  next();
});

//Databases
var urlDatabase =  {
  "b2xVn2": {
    userID: "user1RandomID",
    url: "http://www.lighthouselabs.ca"
  },
  "9sm5xK": {
    userID: "user2RandomID",
    url: "http://www.google.com"
  }
};

var users = {
  user1RandomID: {
    id: "user1RandomID",
    email: "user1@example.com",
    password: "$2a$10$qg.wHxMj4gUiUa95.FhDeuKsVpxliy9uHEn/7eMi6rwg/xDPK9inO"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$qg.wHxMj4gUiUa95.FhDeuKsVpxliy9uHEn/7eMi6rwg/xDPK9inO"
  }
};

//Helpers
// const emailExists = newEmail => email === newEmail;
const emailExists = function(newEmail) {
  for(var user in users) {
    if(users[user].email === newEmail) {
      return true;
    }
  }
  return false;
};

function findUser(email) {
  for (var id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
}

function urlsForUser(id) {
  var userData = {};
  for(var shortURL in urlDatabase) {
    if(id === urlDatabase[shortURL].userID) {
      userData[shortURL] = urlDatabase[shortURL];
    }
  }
  return userData;
}

function validUrl(shortURL) {
  let validity = false;
  for(let key in urlDatabase) {
    if(key === shortURL) {
      validity = true;
    }
  }
  return validity;
}

//GET/POST
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Lists urls/homepage
app.get("/", (req, res) => {
  if(req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session["user_id"]),
    user_id: req.session["user_id"]
  };
  if(!templateVars.user_id) {
    res.status(401).send("Unauthorized. You are not logged in.");
  } else {
    res.render("urls_index", templateVars);
  }
});

//Gives you a random generated 6 alphanumeric variable for a long URL
app.get("/urls/new", (req, res) => {
  let templateVars = { user_id: req.session["user_id"] };
  if (!templateVars.user_id) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.post("/urls", (req, res) => {
  var generateNumbers = generateRandomString();
  urlDatabase[generateNumbers] = {
    userID: req.session["user_id"],
    url: req.body.longURL
  };
  console.log(urlDatabase);
  res.redirect(`urls/${generateNumbers}`);
});

//Routes to shortURL
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].url,
    user_id: req.session["user_id"]
  };
  let urlExists = validUrl(req.params.id);
  if(urlExists) {
    if(!req.session["user_id"]) {
      res.status(401).send("Unauthorized. You need to be logged in.");
    } else if(req.session["user_id"] !== urlDatabase[req.params.id].userID) {
      res.status(401).send("Unauthorized. User does not match");
    } else {
      res.render("urls_show", templateVars);
    }
    res.status(400).send("Bad Request. That URL does not exist.");
  }
});

//Routes to the longURL using shortURL
app.get("/u/:id", (req, res) => {
  let urlExists = validUrl(req.params.id);
  if(urlExists) {
    let longURL = urlDatabase[req.params.id].url;
    res.redirect(longURL);
  } else {
    res.status(400).send("Error. Bad Request. This Url does not exist.");
  }
});

//Delete a URL resource
app.post("/urls/:id/delete", (req, res) => {
  let templateVars = { user_id: req.session["user_id"] };
  if(req.session["user_id"]) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
    if(urlDatabase[req.params.id].req.session["user_id"] !== req.session["user_id"]) {
      res.status(401).send("Error. Unauthorized. User does not own Url for given Id.");
    }
  } else {
    res.status(401);
    // res.send("Error. Unauthorized. User is not logged in.");
    res.redirect('/login');
  }
});

//Edit URLs
app.post("/urls/:id", (req, res) => {
  let templateVars = { user_id: req.session["user_id"] };
  if(req.session["user_id"]) {
    let shortURL = req.params.id;
    urlDatabase[shortURL].url = req.body.updatedURL;
    res.redirect('/urls');
    if(urlDatabase[shortURL].req.session["user_id"] !== req.session["user_id"]) {
      res.status(401).send("Unauthorized. User does not own URL for given Id.");
    } else {
      res.redirect('/login');
    }
    res.status(401).send("Unauthorized. User is not logged in.");
  }
});

//Login
app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const user = findUser(userEmail);
  if (!user) {
    res.status(403);
    res.send("STATUS 403: User with that e-mail cannot be found");
  } else if (!bcrypt.compareSync(userPassword, user.password)) {
    res.status(403);
    res.send("STATUS 403: User with that password does not match");
  } else {
    req.session.user_id = user.id;
    res.redirect('/urls');
  }
});

app.get("/login", (req, res) => {
  res.render('urls_login');
});

//Logout
app.post("/logout", (req, res) => {
  req.session = undefined;
  res.redirect('/urls');
});

//Register
app.get("/register", (req, res) => {
  res.render('urls_register');
});

app.post("/register", (req, res) => {
  // let newId = req.body.user_id;
  let newId = generateRandomString();
  let newEmail = req.body.email;
  let password = req.body.password;
  const hashed_password = bcrypt.hashSync(password, 10);
  const emailDoesExist = emailExists(newEmail);
  if (!newEmail || !password) {
    res.status(400);
    res.send("STATUS 400: user_id/Password is empty");
  } else if (emailDoesExist) {
    res.status(400);
    res.send("STATUS 400: This e-mail already exists");
  }
  users[newId] = {
    id: newId,
    email: newEmail,
    password: hashed_password
  };
  req.session.user_id = newId;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});






