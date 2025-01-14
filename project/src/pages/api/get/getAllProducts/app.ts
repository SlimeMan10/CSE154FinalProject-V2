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