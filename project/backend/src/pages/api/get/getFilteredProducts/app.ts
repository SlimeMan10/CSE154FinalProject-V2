import { NextApiRequest, NextApiResponse } from 'next';
import { getDBConnection } from '../../../db';
import { SERVERERROR, serverError, USERERROR } from '../../errors/app';

/**
 * Retrieves products based on the provided filters.
 * @param {object} req - The request object containing the filters.
 * @param {object} res - The response object to send the result.
 * @throws {Error} If an error occurs during the database operation.
 */
export default async function handler (req: NextApiRequest, res: NextApiResponse) {
  const name: string | string[] | undefined = req.query.name;
  const type: string = Array.isArray(req.query.type) ? req.query.type[0] : req.query.type || '';
  const maxPrice: number = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : 0;
  if (name || type || maxPrice) {
    try {
      let query: string = "SELECT p.name, p.description, p.price, p.stock, p.product_id, p.type, " +
        "r.average_rating AS average_rating, " +
        "r.num_ratings AS total_ratings, " +
        "GROUP_CONCAT(DISTINCT u.username) AS review_usernames " +
        "FROM Products p " +
        "LEFT JOIN Reviews r ON r.product_id = p.product_id " +
        "LEFT JOIN Users u ON r.username = u.username";
      const db = await getDBConnection();
      let conditions: string[] = [];
      let params: Array<any> = [];
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
      res.status(SERVERERROR).send(serverError);
    }
  } else {
    res.status(USERERROR).send("Must Have At Least One Filter");
  }
}

