const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  //write code to check is the username is valid
}

const authenticatedUser = (username, password) => {
  let user = users.filter((user) => user.username === username && user.password === password)
  if (user.length > 0) {
    return true
  } else {
    return false
  }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username
  const password = req.body.password

  if (!username || !password) {
    res.status(404).json({ message: "Error loging in" })
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, "access", { expiresIn: 60 * 60 })

    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).json({ message: "User successfully logged in" })
  } else {
    res.status(208).json({ message: "Invalid login, check username and password" })
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;

  let validBook = books[isbn];
  if (validBook) {
    const reviews = validBook.reviews;
    const existingReview = reviews[username];
    reviews[username] = review;
    if (existingReview) {
      return res.status(200).send("Review successfully updated");
    } else {
      return res.status(200).send("Review successfully added");
    }
  } else {
    return res.status(404).json({ message: "Provided book does not exist" });
  }
});

// Remove a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  let validBook = books[isbn];

  if (validBook) {
    const existingReview = validBook.reviews[username];
    if (existingReview) {
      delete validBook.reviews[username];
    }
    return res
      .status(200)
      .send(
        `Review from User, ${username} removed successfully from Book (ISBN: ${isbn}).`
      );
  } else {
    return res.status(404).json({ message: "Provided book does not exist" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
