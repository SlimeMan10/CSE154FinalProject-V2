import { NextApiRequest, NextApiResponse } from 'next';
import { getDBConnection } from '../../../../db';
import { SERVERERROR, serverError, USERERROR } from '../../errors/app';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let product_id: string | null = req.body.product_id;
  let name: string | null = req.body.name;
  let description: string | null = req.body.description;
  let price: number | null = req.body.price;
  let stock: number | null = req.body.stock;
  let type: string | null = req.body.type;
  if (product_id && name && description && price && stock && type) {
    let db;
    try {
      const query: string = "INSERT INTO Products (product_id, name, description, price, stock, type) VALUES (?, ?, ?, ?, ?, ?)";
      db = await getDBConnection();
      await db.run(query, [product_id, name, description, price, stock, type]);
      res.json({"message": "Product added successfully"});
    } catch (err) {
      res.status(SERVERERROR).json({"error": serverError});
    } finally {
      if (db) {
        await db.close();
      }
    }
    //make sure you do not have any spaces in the form fields
  } else {
    let missing: string[] = [];
    if (!product_id) missing.push("product_id");
    if (!name) missing.push("name");
    if (!description) missing.push("description");
    if (!price) missing.push("price");
    if (!stock) missing.push("stock");
    if (!type) missing.push("type");
    res.status(USERERROR).send("Missing required product information");
  }
}