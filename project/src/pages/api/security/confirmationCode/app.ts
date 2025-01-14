/**
 * Generates a unique confirmation code for a purchase.
 * @returns {string} The generated confirmation code.
 */
function generateConfirmationCode() {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}