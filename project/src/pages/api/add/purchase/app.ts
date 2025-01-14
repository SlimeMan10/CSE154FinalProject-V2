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