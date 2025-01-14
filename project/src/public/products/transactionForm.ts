import { id } from '../extraFunctions/extra.js';
import { clearError } from '../extraFunctions/events.js';
  /**
   * Hides the transaction area and displays the product area.
   */
  export function hideTransactions() : void {
    id('transaction-area').classList.add('hidden');
    id('product-area').classList.remove('hidden');
    id('all-products').classList.remove('hidden');
    id('main-item-section').classList.remove('hidden');
  }

  /**
   * Clears the payment form fields.
   */
  export function clearPaymentForm() : void {
    (id('card-holder') as HTMLInputElement).value = '';
    (id('card-number') as HTMLInputElement).value = '';
    (id('card-expiry') as HTMLInputElement).value = '';
    (id('card-cvv') as HTMLInputElement).value = '';
    (id('billing-address') as HTMLInputElement).value = '';
    clearError('payment');
  }