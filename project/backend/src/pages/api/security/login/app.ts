import crypto from "crypto";
import { NextApiRequest, NextApiResponse } from 'next';
import { USERERROR, SERVERERROR, serverError } from "../../errors/app";
import { getDBConnection } from "../../database";
import { hashPassword } from "../../security/hash/app";

/**
 * Logs in a user with the provided credentials.
 * @param {object} req - The request object containing the user credentials.
 * @param {object} res - The response object to send the result.
 * @throws {Error} If an error occurs during the database operation.
 */
export default async function login(req: NextApiRequest, res: NextApiResponse ) {
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
}

