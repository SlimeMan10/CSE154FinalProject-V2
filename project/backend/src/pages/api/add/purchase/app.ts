import { NextApiRequest, NextApiResponse } from 'next';
import { getDBConnection } from '../../../../../../frontend/lib/db';
import { SERVERERROR, serverError, USERERROR } from '../../errors/app';
import { generateConfirmationCode } from '../../security/confirmationCode/app';

/**
 * Processes a product purchase.
 * @param {object} req - The request object containing the purchase details.
 * @param {object} res - The response object to send the result.
 * @throws {Error} If an error occurs during the database operation.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const username: string | null = typeof req.body.username === 'string' ? req.body.username : null;
  const product_id: string | null = typeof req.body.product_id === 'string' ? req.body.product_id : null;

  if (!username) {
   res.status(400).json({ error: "Username is required" });
  } else {
    let db;
    try {
      db = await getDBConnection();
      //let's check if we even have stock
      const stockQuery: string = "SELECT stock FROM Products WHERE product_id = ?";
      const stockResult = await db.get(stockQuery, [product_id]);
      if (!stockResult || stockResult.stock <= 0) {
        return res.status(400).json({ error: "Product is out of stock" });
      }
      const updateStockQuery: string = "UPDATE Products SET stock = stock - 1 WHERE product_id = ?";
      await db.run(updateStockQuery, [product_id]);
      //Get the cost of the product
      const costQuery: string = "SELECT price FROM Products WHERE product_id = ?";
      const cost = await db.get(costQuery, [product_id]);
      // Create a new order
      const confirmationCode: string = generateConfirmationCode();
      const insertOrderQuery: string = "INSERT INTO Orders (order_id, product_id, username, total_amount) VALUES (?, ?, ?, ?)";
      await db.run(insertOrderQuery, [confirmationCode, product_id, username, cost]);
      res.json({ message: "Purchase successful", confirmationCode: confirmationCode });
    } catch (err) {
      res.status(SERVERERROR).json({ error: "An error occurred while processing the purchase" });
    } finally {
      if (db) {
        await db.close();
      }
    }
  }
}

