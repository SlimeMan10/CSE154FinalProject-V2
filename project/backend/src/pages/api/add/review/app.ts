import { NextApiRequest, NextApiResponse } from "next";
import { serverError, SERVERERROR } from "../../errors/app";
import { getDBConnection } from "../../../../db";

/**
 * Adds a new product to the database.
 * @param {object} req - The request object containing the product details.
 * @param {object} res - The response object to send the result.
 * @throws {Error} If an error occurs during the database operation.
 */
export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  const username: string= req.body.username;
  const product_id:string = req.body.product_id;
  const rating:number = req.body.rating;
  const comment:string = req.body.comment;
  let db;
  try {
    db = await getDBConnection();
    await db.run("BEGIN TRANSACTION");
    // Generate a new review_id
    const reviewIdQuery: string = "SELECT MAX(review_id) + 1 AS next_review_id FROM Reviews";
    const { next_review_id } = await db.get(reviewIdQuery);

    // Insert the new review
    const insertQuery: string = "INSERT INTO Reviews (review_id, username, product_id, rating, comment, num_ratings) VALUES (?, ?, ?, ?, ?, 1)";
    await db.run(insertQuery, [next_review_id, username, product_id, rating, comment]);

    // Calculate the new average rating for the product
    const averageRatingQuery: string = "SELECT AVG(rating) AS average_rating, COUNT(review_id) AS num_ratings FROM Reviews WHERE product_id = ?";
    const { average_rating, num_ratings } = await db.get(averageRatingQuery, [product_id]);

    // Update the average_rating and num_ratings columns in the Reviews table
    const updateQuery: string = "UPDATE Reviews SET average_rating = ?, num_ratings = ? WHERE product_id = ?";
    await db.run(updateQuery, [average_rating, num_ratings, product_id]);

    await db.run("COMMIT");

    res.json({ message: "Review added successfully", averageRating: Number(average_rating.toFixed(2)), numRatings: num_ratings });
  } catch (err) {
    await db.run("ROLLBACK");
    res.status(SERVERERROR).send(serverError);
  } finally {
    if (db) {
      await db.close();
    }
  }
}
