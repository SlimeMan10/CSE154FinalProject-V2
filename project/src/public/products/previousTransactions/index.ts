import { user } from '../users/user.js';
import { id, gen } from '../extraFunctions/extra.js';
import { showError } from '../extraFunctions/events.js';
import { Order } from '../types/index.js';
import { displayPreviousTransactions } from '../displays/index.js';

  /**
   * Retrieves the user's transaction history.
   */
  export async function getTransactions() {
    try {
      const response : Response = await fetch("/transactions?username=" + user);
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      const data : Order = await response.json();
      id('product-area').classList.add('hidden');
      id('all-products').classList.add('hidden');
      const list = gen('div');
      list.classList.add('transaction-list');
      displayPreviousTransactions(data, list);
    } catch (err) {
      showError('transactions', 'Failed to load transaction history. Please try again later.', false);
    }
  }