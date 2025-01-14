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