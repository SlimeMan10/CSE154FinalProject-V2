import { id } from '../../extraFunctions/redudant/index.js';
import { clearError, showError } from '../../extraFunctions/events.js';
import { showLoggedIn } from '../login/index.js';
import { checkIfStrong } from './passwordEvents.js';

export let user: string | null = null;

export function savedUserEvent() : void {
  const savedUser : string | null = localStorage.getItem('username');
  //if the user saved then we log them in already
  if (savedUser) {
    user = savedUser;
    showLoggedIn();
  }
}

  /**
   * Logs in the user with the provided credentials.
   * @returns {Promise<boolean>} - Returns a promise that resolves to true if the login was successful, false otherwise.
   */
  export async function login() {
    clearError('login');
    let username = (id('login-username') as HTMLFormElement).value;
    let password = (id('login-password') as HTMLFormElement).value;

    if (!username || !password) {
      showError('login', 'Please enter both username and password', false);
      return false;
    }

    try {
      const dataForm = new FormData();
      dataForm.append("username", username);
      dataForm.append("password", password);
      const response = await fetch("/login", {
        method: "POST",
        body: dataForm,
      });
      if (!response.ok) {
        showError('login', 'Login failed', false);
        return false;
      }
      const data = await response.json();
      if (data.valid) {
        user = username;
        if (user) {
          localStorage.setItem('username', user);
        }
        return true;
      } else {
        showError('login', 'Invalid username or password', false);
        return false;
      }
    } catch (err) {
      showError('login', 'Server error. Please try again later.', false);
      return false;
    }
  }

  /**
   * Logs out the user and updates the UI accordingly.
   */
  export function logout() {
    if (user !== null) {
      user = null;
      localStorage.removeItem('username');
      id('login-btn').classList.remove('hidden');
      id('logout-btn').classList.add('hidden');
      id('create-account-btn').classList.remove('hidden');
      id('previous-transactions').classList.add('hidden');
    }
  }

   /**
   * Creates a new user account if the password is strong enough and matches the confirmation.
   */
   export async function createNewUser() {
    clearError('create-account');
    let password = (id('create-password-input-form') as HTMLFormElement).value;
    let strength = checkIfStrong(password);
    if (strength) {
      let success = await createUser();
      if (success) {
        showLoggedIn();
      }
    }
  }

    /**
   * Creates a new user account.
   * @returns {Promise<boolean>} - Returns a promise that resolves to true if the user was created successfully, false otherwise.
   */
    export async function createUser() {
      try {
        let username = (id('username') as HTMLFormElement).value;
        let password = (id('create-password-input-form') as HTMLFormElement).value;
        let email = (id('email') as HTMLFormElement).value;

        if (!username || !password || !email) {
          showError('create-account', 'All fields are required', false);
          return;
        }

        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);
        formData.append("email", email);

        let response = await fetch('/newUser', {
          method: "POST",
          body: formData
        });

        let data = await response.json();
        if (data.message === "User created") {
          user = username;
          if (user) {
            localStorage.setItem('username', user);
          }
          return true;
        } else {
          showError('create-account', 'Username or email already exists', false);
        }
      } catch (err) {
        showError('create-account', 'Failed to create account. Please try again.', false);
      }
    }