'use strict';

//install express, sqlite3, sqlite, crypto, multer
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const crypto = require('crypto');
const multer = require('multer');
const upload = multer();

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(upload.none())

const serverError = 'An error occurred on the server. Try again later.';
const USERERROR = 400;
const SERVERERROR = 500;

/**
 * Retrieves a database connection.
 * @returns {Promise<sqlite3.Database>} A promise that resolves to the database connection.
 */
async function getDBConnection() {
 const db = await sqlite.open({filename: 'store.db', driver: sqlite3.Database});
 return db;
}

//use Form in post for this
//created this for testing to make it easier for you to check instead of writing queries in the terminal
app.post("/addProduct", async function(req, res) {
 let product_id = req.body.product_id;
 let name = req.body.name;
 let description = req.body.description;
 let price = req.body.price;
 let stock = req.body.stock;
 let type = req.body.type;
 if (product_id && name && description && price && stock && type) {
   try {
     const query = "INSERT INTO Products (product_id, name, description, price, stock, type) VALUES (?, ?, ?, ?, ?, ?)";
     const db = await getDBConnection();
     await db.run(query, [product_id, name, description, price, stock, type]);
     await db.close();
     res.json({"message": "Product added successfully"});
   } catch (err) {
     res.status(SERVERERROR).json({"error": serverError});
   }
   //make sure you do not have any spaces in the form fields
 } else {
   let missing = [];
   if (!product_id) missing.push("product_id");
   if (!name) missing.push("name");
   if (!description) missing.push("description");
   if (!price) missing.push("price");
   if (!stock) missing.push("stock");
   if (!type) missing.push("type");
   res.status(USERERROR).type('text').send("Missing required product information");
 }
});

/**
 * Creates a new user account.
 * @param {object} req - The request object containing the user details.
 * @param {object} res - The response object to send the result.
 * @throws {Error} If an error occurs during the database operation.
 */
app.post("/newUser", async function(req, res) {
  let username = req.body.username;
  let password = req.body.password;
  let email = req.body.email;

  if (username && password && email) {
    let db;
    try {
      db = await getDBConnection();

      // Check email is taken
      const emailQuery = "SELECT * FROM Users WHERE email = ?";
      const emailResult = await db.all(emailQuery, [email]);
      if (emailResult.length > 0) {
        await db.close();
        res.status(USERERROR).type('text').send("Email is already taken");
      } else {
        // Check if username is already taken
        const usernameQuery = "SELECT * FROM Users WHERE username = ?";
        const usernameResult = await db.all(usernameQuery, [username]);
        if (usernameResult.length > 0) {
          await db.close();
          res.status(USERERROR).type('text').send("Username is already taken");
        } else {
          // Create new user
          const query = "INSERT INTO Users (username, email, salt, hash) VALUES (?, ?, ?, ?)";
          const salt = generateSalt();
          const hashedPassword = await hashPassword(password, salt);
          await db.run(query, [username, email, salt, hashedPassword]);
          await db.close();
          res.json({"message": "User created"});
        }
      }
    } catch (err) {
      if (db) {
        await db.close();
      }
      res.status(SERVERERROR).json({ "error": serverError });
    }
  } else {
    res.status(USERERROR).type('text').send("Must add all parameters");
  }
});

/**
 * Generates a random salt for password hashing.
 * @returns {Buffer} The generated salt.
 */
function generateSalt() {
 return crypto.randomBytes(16);
}

/**
 * Hashes a password using the provided salt.
 * @param {string} password - The password to be hashed.
 * @param {Buffer} salt - The salt to be used for hashing.
 * @returns {Promise<Buffer>} A promise that resolves to the hashed password.
 */
function hashPassword(password, salt) {
 let hash = new Promise(function(resolve, reject) {
   crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
     if (err) {
       reject(err);
     } else {
       resolve(derivedKey);
     }
   });
 });
 return hash;
}

/**
 * Retrieves products based on the provided filters.
 * @param {object} req - The request object containing the filters.
 * @param {object} res - The response object to send the result.
 * @throws {Error} If an error occurs during the database operation.
 */
app.get("/getProducts", async function(req, res) {
  const name = req.query.name;
  const type = req.query.type;
  const maxPrice = req.query.maxPrice;
  if (name || type || maxPrice) {
    try {
      let query = "SELECT p.name, p.description, p.price, p.stock, p.product_id, p.type, " +
        "r.average_rating AS average_rating, " +
        "r.num_ratings AS total_ratings, " +
        "GROUP_CONCAT(DISTINCT u.username) AS review_usernames " +
        "FROM Products p " +
        "LEFT JOIN Reviews r ON r.product_id = p.product_id " +
        "LEFT JOIN Users u ON r.username = u.username";
      const db = await getDBConnection();
      let conditions = [];
      let params = [];
      if (name) {
        conditions.push("LOWER(p.name) LIKE LOWER(?)");
        params.push(`%${name}%`);
      }
      if (type) {
        conditions.push("p.type = ?");
        params.push(type);
      }
      if (maxPrice) {
        conditions.push("p.price <= ?");
        params.push(maxPrice);
      }
      query += " WHERE " + conditions.join(" AND ");
      query += " GROUP BY p.product_id";
      const data = await db.all(query, params);
      await db.close();
      res.json(data);
    } catch (err) {
      res.status(SERVERERROR).type('text').send(serverError);
    }
  } else {
    res.status(USERERROR).type('text').send("Must Have At Least One Filter");
  }
});

/**
 * Retrieves all products from the database.
 * @param {object} req - The request object.
 * @param {object} res - The response object to send the result.
 * @throws {Error} If an error occurs during the database operation.
 */
app.get("/getAllProducts", async function(req, res) {
  try {
    const db = await getDBConnection();
    const query = "SELECT p.product_id, p.name, p.description, p.price, p.stock, p.type, COALESCE(r.average_rating, 0) as average_rating, " +
                "COALESCE(r.num_ratings, 0) as num_ratings  " +
                  "FROM Products p " +
                  "LEFT JOIN Reviews r ON r.product_id = p.product_id " +
                  "GROUP BY p.product_id";
    const data = await db.all(query);
    await db.close();
    res.json(data);
  } catch (err) {
    res.status(SERVERERROR).type('text').send(serverError);
  }
});

/**
 * Logs in a user with the provided credentials.
 * @param {object} req - The request object containing the user credentials.
 * @param {object} res - The response object to send the result.
 * @throws {Error} If an error occurs during the database operation.
 */
app.post("/login", async function(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    res.status(USERERROR).type('text').send("Missing username or password");
  } else {
    try {
      const query = "SELECT salt, hash FROM Users WHERE username = ?";
      const db = await getDBConnection();
      const user = await db.get(query, [username]);
      if (!user) {
        await db.close();
        res.status(USERERROR).type('text').send("User does not exist");
      } else {
        const hashedPassword = await hashPassword(password, user.salt);
        const match = crypto.timingSafeEqual(hashedPassword, user.hash);
        await db.close();
        if (match) {
          res.json({"message": "Login successful", "valid": true});
        } else {
          res.status(USERERROR).type('text').send("Password did not match the username");
        }
      }
    } catch (err) {
      res.status(SERVERERROR).type('text').send(serverError);
    }
  }
});

/**
 * Processes a product purchase.
 * @param {object} req - The request object containing the purchase details.
 * @param {object} res - The response object to send the result.
 * @throws {Error} If an error occurs during the database operation.
 */
app.post("/purchase", async function(req, res) {
  const username = req.body.username;
  const product_id = req.body.product_id;
  const cost = req.body.cost;

  if (!username) {
   res.status(400).json({ error: "Username is required" });
  } else {
    try {
      const db = await getDBConnection();
      //let's check if we even have stock
      const stockQuery = "SELECT stock FROM Products WHERE product_id = ?";
      const stockResult = await db.get(stockQuery, [product_id]);
      if (!stockResult || stockResult.stock <= 0) {
        await db.close();
        return res.status(400).json({ error: "Product is out of stock" });
      }
      const updateStockQuery = "UPDATE Products SET stock = stock - 1 WHERE product_id = ?";
      await db.run(updateStockQuery, [product_id]);
      // Create a new order
      const confirmationCode = generateConfirmationCode();
      const insertOrderQuery = "INSERT INTO Orders (order_id, product_id, username, total_amount) VALUES (?, ?, ?, ?)";
      await db.run(insertOrderQuery, [confirmationCode, product_id, username, cost]);
      await db.close();
      res.json({ message: "Purchase successful", confirmationCode: confirmationCode });
    } catch (err) {
      res.status(SERVERERROR).json({ error: "An error occurred while processing the purchase" });
    }
  }
});

/**
 * Generates a unique confirmation code for a purchase.
 * @returns {string} The generated confirmation code.
 */
function generateConfirmationCode() {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

/**
 * Retrieves all previous transactions for a user.
 * @param {object} req - The request object containing the username.
 * @param {object} res - The response object to send the result.
 * @throws {Error} If an error occurs during the database operation.
 */
app.get("/transactions", async function (req, res) {
  const username = req.query.username;
  if (!username) {
    res.status(400).json({ error: "Username is required" });
  } else {
    try {
      const db = await getDBConnection();
      const query = "SELECT o.order_id, p.name, p.description, p.price, p.product_id " +
                    "FROM Orders o " +
                    "JOIN Products p ON o.product_id = p.product_id " +
                    "WHERE o.username = ?";
      const transactions = await db.all(query, [username]);
      await db.close();
      res.json(transactions);
    } catch (err) {
      res.status(SERVERERROR).json({ error: "An error occurred while retrieving transactions" });
    }
  }
});

/**
 * Adds a new product to the database.
 * @param {object} req - The request object containing the product details.
 * @param {object} res - The response object to send the result.
 * @throws {Error} If an error occurs during the database operation.
 */
app.post("/review", async function(req, res) {
  const username = req.body.username;
  const product_id = req.body.product_id;
  const rating = req.body.rating;
  const comment = req.body.comment;
  let db = null;
  try {
    db = await getDBConnection();
    await db.run("BEGIN TRANSACTION");
    // Generate a new review_id
    const reviewIdQuery = "SELECT MAX(review_id) + 1 AS next_review_id FROM Reviews";
    const { next_review_id } = await db.get(reviewIdQuery);

    // Insert the new review
    const insertQuery = "INSERT INTO Reviews (review_id, username, product_id, rating, comment, num_ratings) VALUES (?, ?, ?, ?, ?, 1)";
    await db.run(insertQuery, [next_review_id, username, product_id, rating, comment]);

    // Calculate the new average rating for the product
    const averageRatingQuery = "SELECT AVG(rating) AS average_rating, COUNT(review_id) AS num_ratings FROM Reviews WHERE product_id = ?";
    const { average_rating, num_ratings } = await db.get(averageRatingQuery, [product_id]);

    // Update the average_rating and num_ratings columns in the Reviews table
    const updateQuery = "UPDATE Reviews SET average_rating = ?, num_ratings = ? WHERE product_id = ?";
    await db.run(updateQuery, [average_rating, num_ratings, product_id]);

    await db.run("COMMIT");
    await db.close();

    res.json({ message: "Review added successfully", averageRating: Number(average_rating.toFixed(2)), numRatings: num_ratings });
  } catch (err) {
    if (db) {
      await db.run("ROLLBACK");
      await db.close();
    }
    res.status(SERVERERROR).type("text").send(serverError);
  }
});

app.use(express.static('public'));
const PORT_NUMBER = 8000;
const PORT = process.env.PORT || PORT_NUMBER;
app.listen(PORT);