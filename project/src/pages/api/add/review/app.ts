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