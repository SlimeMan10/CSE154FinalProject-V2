/**
 * Hashes a password using the provided salt.
 * @param {string} password - The password to be hashed.
 * @param {Buffer} salt - The salt to be used for hashing.
 * @returns {Promise<Buffer>} A promise that resolves to the hashed password.
 */
function hashPassword(password, salt) {
  let hash = new Promise(function(resolve, reject) {
    crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
      if (err) {
        reject(err);
      } else {
        resolve(derivedKey);
      }
    });
  });
  return hash;
 }