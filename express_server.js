//Required
var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

//Let's us use ejs
app.set("view engine", "ejs")

//Middlewares
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//URL Routes
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Lists urls/homepage
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
                       username: req.cookies["username"] };
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

function generateRandomString() {
  var text = "";
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < 5; i++)
    text = text + possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

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
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// TODO : there's some crazy bug when I change the url to 'lighthouselabs.ca' and then try the redirect link








