import { id } from '../../extraFunctions/redudant/index.js';
import { clearError , showError } from '../../extraFunctions/events.js';
import { login, user } from '../userLogStuff/user.js';

/**
   * Shows the logged-in state and displays the appropriate elements.
   */
export function showLoggedIn(): void {
  id('logout-btn').classList.remove('hidden');
  id('login-btn').classList.add('hidden');
  id('create-account-btn').classList.add('hidden');
  id('login-section').classList.add('hidden');
  id('product-area').classList.remove('hidden');
  id('all-products').classList.remove('hidden');
  id('main-item-section').classList.remove('hidden');
  id('previous-transactions').classList.remove('hidden');
}

  /**
   * Handles the login process.
   */
  export function handleLogin(): void {
    handleLoginClick();
    id('submit-login-btn').addEventListener('click', async function() {
      let logged: boolean = await login();
      if (logged) {
        if (user) {
          localStorage.setItem('username', user);
        } else {
          logInFailed();
        }
        showLoggedIn();
      } else {
        logInFailed();
      }
    });
  }

 /**
   * Handles the login click event.
   */
 function handleLoginClick(): void {
  if (id('username')) {
    (id('username') as HTMLInputElement).value = '';
  }
  if (id('email')) {
    (id('email') as HTMLInputElement).value = '';
  }
  if (id('create-password-input-form')) {
    (id('create-password-input-form') as HTMLInputElement).value = '';
  }
  if (id('verify-password-input')) {
    (id('verify-password-input') as HTMLInputElement).value = '';
  }
  clearError('create-account');
  id('product-area').classList.add('hidden');
  id('all-products').classList.add('hidden');
  id('main-item-section').classList.add('hidden');
  id('account-section').classList.add('hidden');
  id('login-section').classList.remove('hidden');
}

  /**
   * Displays an error message for a failed login attempt.
   */
  function logInFailed(): void {
    showError('login', 'Invalid username or password', false);
  }

  export function handleCreateAccountClick(): void {
    let loginUsername: HTMLInputElement = (id('login-username') as HTMLInputElement)
    let loginPassword: HTMLInputElement = (id('login-password') as HTMLInputElement)
    if (loginUsername) {
      loginUsername.value = '';
    }
    if (loginPassword) {
      loginPassword.value = '';
    }
    clearError('login');
    id('product-area').classList.add('hidden');
    id('all-products').classList.add('hidden');
    id('main-item-section').classList.add('hidden');
    id('login-section').classList.add('hidden');
    id('account-section').classList.remove('hidden');
  }
