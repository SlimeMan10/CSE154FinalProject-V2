import crypto from 'crypto';

/**
 * Generates a unique confirmation code for a purchase.
 * @returns {string} The generated confirmation code.
 */
export function generateConfirmationCode(): string {
  let code: string = crypto.randomBytes(3).toString('hex') as string;
  return code.toUpperCase();
}