import { id } from '../extraFunctions/extra.js';
import { showError, clearError } from '../extraFunctions/events.js';

const minPasswordLength: number = 8;

  /**
   * Checks if a password is strong and displays appropriate error messages.
   * @param {string} password - The password to check.
   * @returns {boolean} - Returns true if the password is strong, false otherwise.
   */
  export function checkIfStrong(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= minPasswordLength;

    clearError('create-account');

    if (!isLongEnough) showError('create-account', 'Password must be at least 8 characters', false);
    if (!hasUpperCase) showError('create-account', 'Password must contain an uppercase letter', false);
    if (!hasLowerCase) showError('create-account', 'Password must contain a lowercase letter', false);
    if (!hasNumbers) showError('create-account', 'Password must contain a number', false);
    if (!hasSpecialChar) showError('create-account', 'Password must contain a special character', false);

    const isValid = hasUpperCase && hasLowerCase && hasNumbers &&
                   hasSpecialChar && isLongEnough;

    if (isValid) {
        showError('create-account', 'Password is strong', true);
    }

    return isValid;
  }

  /**
   * Verifies that the password matches the confirm password input.
   * @returns {boolean} - Returns true if the passwords match, false otherwise.
   */
  export function verifyPassword(): boolean{
    const verify: string = id('verify-password-input').value;
    const password: string = id('create-password-input-form').value;
    if (verify !== password) {
      showError('create-account', 'Passwords do not match', false);
    }
    return verify === password;
  }