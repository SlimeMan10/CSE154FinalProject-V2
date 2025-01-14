import { NextApiRequest, NextApiResponse } from 'next';
import { getDBConnection } from '../../../../../lib/db';
import { SERVERERROR, serverError, USERERROR } from '../../errors/app';
import { generateSalt, hashPassword } from '../../../../../lib/auth';

async function isTaken(db: any, field: string, value: string): Promise<boolean> {
  const query = `SELECT * FROM Users WHERE ${field} = ?`;
  const result = await db.all(query, [value]);
  return result.length > 0;
}

export default async function newUser(req: NextApiRequest, res: NextApiResponse) {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(USERERROR).json({ error: "All fields are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(USERERROR).json({ error: "Invalid email format" });
  }

  let db;
  try {
    db = await getDBConnection();

    if (await isTaken(db, "email", email)) {
      return res.status(USERERROR).json({ error: "Email is already taken" });
    }
    if (await isTaken(db, "username", username)) {
      return res.status(USERERROR).json({ error: "Username is already taken" });
    }

    const salt = generateSalt();
    const hashedPassword = await hashPassword(password, salt);

    const query = "INSERT INTO Users (username, email, salt, hash) VALUES (?, ?, ?, ?)";
    await db.run(query, [username, email, salt, hashedPassword]);

    res.status(200).json({ message: "User created successfully" });
  } catch (err) {
    res.status(SERVERERROR).json({ error: serverError });
  } finally {
    if (db) {
      await db.close();
    }
  }
}