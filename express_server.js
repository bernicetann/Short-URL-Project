//Required
var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const helpers = require('./helpers/helperfunctions');
const generateRandomString = helpers.generatedRand;
const bcrypt = require('bcrypt');

//Let's us use ejs
app.set("view engine", "ejs")

//Middlewares
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use((req, res, next) => {
  res.locals.user_id = req.cookies.user_id;
  next();
});

//Databases
var urlDatabase =  {
  "b2xVn2": {
    userID: "user1RandomID",
    url: "http://www.lighthouselabs.ca"
  },
  "9sm5xK": {userID: "user2RandomID",
             url: "http://www.google.com"
            }
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

//Helpers
// const emailExists = newEmail => email === newEmail;
const emailExists = function(newEmail) {
  for(var user in users) {
    if(users[user].email === newEmail) {
      return true;
    }
  }
  return false;
}

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

//GET/POST
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Lists urls/homepage
app.get("/", (req, res) => {
  res.end("Welcome!");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlsForUser(req.cookies["user_id"]),
                       user_id: req.cookies["user_id"] };
  if(!templateVars.user_id) {
    res.send("Unauthorized. You are not logged in.");
    } else {
    res.render("urls_index", templateVars);
  }
});

//Gives you a random generated 6 alphanumeric variable for a long URL
app.get("/urls/new", (req, res) => {
  let templateVars = { user_id: req.cookies["user_id"] };
  if (!templateVars.user_id) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.post("/urls", (req, res) => {
  var generateNumbers = generateRandomString();
  urlDatabase[generateNumbers] = { userID: req.cookies["user_id"],
                                   url: req.body.longURL };
  console.log(urlDatabase);
  res.redirect(`urls/${generateNumbers}`);
});

//Routes to shortURL
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       longURL: urlDatabase[req.params.id],
                       user_id: req.cookies["user_id"] };
  if(!templateVars.user_id) {
    res.send("Unauthorized. You need to be logged in.")
  } else if(templateVars.user_id !== urlDatabase[req.params.id].userID) {
    res.send("Unauthorized. User does not match");
  } else {
    res.render("urls_show", templateVars);
  }
});

//Routes to the longURL using shortURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].url;
  res.redirect(longURL);
});

//Delete a URL resource
app.post("/urls/:id/delete", (req, res) => {
  let templateVars = { user_id: req.cookies["user_id"] };
  if(templateVars.user_id) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
})

//Edit URLs
app.post("/urls/:id", (req, res) => {
  let templateVars = { user_id: req.cookies["user_id"] };
  if(templateVars.user_id) {
    let shortURL = req.params.id
    urlDatabase[shortURL] = req.body.updatedURL;
    res.redirect('/urls');
  } else {
    res.redirect('/login');
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
  } else if (bcrypt.compareSync(userPassword, user.password)) {
    res.status(403);
    res.send("STATUS 403: User with that password does not match");
  } else {
    res.cookie('user_id', user.id);
    res.redirect('/');
  }
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
   users[newId] = { id: newId,
                   email: newEmail,
                   password: hashed_password };
  res.cookie('user_id', newId);
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});






