import { id, qs, gen } from './extraFunctions/redudant/index.js';
import { showError, clearError } from './extraFunctions/events.js';
import { checkIfStrong, verifyPassword } from './userEvents/passwordEvents.js';
import { Product, PaymentFields, purchaseFields } from './types/index.js';
import { handleCreateAccountClick, handleLogin } from './userEvents/login/index.js';
import { logout, savedUserEvent, login, createNewUser, createUser } from './userEvents/userLogStuff/user.js';
import { getTransactions } from './products/previousTransactions/index.js';
import { displayAllProducts, hideTransactions } from './products/displays/index.js';
import { displayAllWithSearchTerms } from './products/search/index.js';

"use strict";
(function() {

  window.addEventListener('load', init);

  /**
   * Initializes the application by setting up event listeners and displaying products.
   */
  function init() : void {
    //break up methods to make init smaller
    savedUserEvent();
    displayAllProducts();
    loginEvents();
    passwordEvents();
    paymentStuff();
    createAccountEvent();
    searchBarEvent();
    previousTransactionEvent();
    shopAllEvent();
  }

    /**
   * Sets up event listeners for password-related elements.
   */
  function passwordEvents() : void {
    id('create-password-input-form').addEventListener('input', function(event: Event) {
      let target : HTMLInputElement = event.target as HTMLInputElement;
      let password = target.value;
      checkIfStrong(password);
    });

    id('create-user-btn').addEventListener('click', function() {
      let password = id('create-password-input-form').value;
      let strength = checkIfStrong(password);
      if (strength) {
        let isVerified = verifyPassword();
        if (isVerified) {
          createNewUser();
        }
      }
    });

    const togglePassword = id('toggle-password');
    const passwordInput = id('create-password-input-form');
    togglePassword.addEventListener('click', function() {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      this.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
    });
  }

    /**
   * Sets up event listeners for login-related elements.
   */
    function loginEvents() {
      id('login-btn').addEventListener('click', handleLogin);
      id('logout-btn').addEventListener('click', logout);
    }

  function shopAllEvent() : void {
    let shopAll : HTMLElement = id('shop-all');
    if (shopAll) {
      shopAll.addEventListener('click', function(event) {
        event.preventDefault();
        hideTransactions();
        displayAllProducts();
      });
    }
  }

  function previousTransactionEvent() : void {
    let previousTransactions : HTMLElement | null = id('previous-transactions');
    if (previousTransactions) {
      previousTransactions.addEventListener('click', function(event: MouseEvent) {
        event.preventDefault();
        getTransactions();
      });
    }
  }

  function searchBarEvent() : void {
    let searchButton : HTMLElement = id('search-button');
    if (searchButton) {
      searchButton.addEventListener('click', function(event: Event) {
        handleSearch(event);
      });
    }
  }

  /**
 * Handles the search functionality.
 * @param {Event} event - The search button click event.
 */
function handleSearch(event: Event): void {
  event.preventDefault();
  // Safely cast elements using optional chaining
  const search : HTMLInputElement | null = qs('#search-bar .search-input') as HTMLInputElement | null;
  const price : HTMLInputElement | null= id('max-price') as HTMLInputElement | null;
  const category : HTMLSelectElement | null = id('category') as HTMLSelectElement | null;
  // Safely access values with optional chaining and trim them
  const searchInput = search?.value.trim() || null;
  const maxPrice = price?.value.trim() || null;
  const categoryValue = category?.value || null;

  // Check if any input is provided
  if (searchInput || maxPrice || categoryValue) {
    hideTransactions();
    displayAllWithSearchTerms();
  }
}

  function createAccountEvent() : void {
    let createAccountBtn : HTMLElement = id('create-account-btn');
    if(createAccountBtn) {
      createAccountBtn.addEventListener('click', handleCreateAccountClick);
    }
  }
})();
function paymentStuff() {
  throw new Error('Function not implemented.');
}

