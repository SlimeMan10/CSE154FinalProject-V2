
import { user } from '../users/user.js'
import { showError, displaySuccessMessage } from '../extraFunctions/events.js';
import { id } from '../extraFunctions/extra.js';
import { hideTransactions, clearPaymentForm } from './transactionForm.js';
import { PaymentFields, purchaseFields } from '../../types/index.js';

export let productId: number | null= null;
/**
   * Handles the submission of a payment.
   * @throws {Error} - Throws an error if the purchase fails.
   */
export async function handlePaymentSubmission(): Promise<void> {
  try {
    if(productId === null) {
      throw new Error('No product selected');
    }
    await handlePurchase();
    id('payment-section').classList.add('hidden');
    hideTransactions();
    clearPaymentForm();
  } catch (err) {
    showError('payment', 'Failed to complete purchase. Please try again.', false);
  }
}

/**
   * Handles the purchase of a product.
   * @param {number} productId - The product ID.
   * @param {number} price - The product price.
   * @throws {Error} - Throws an error if the purchase fails.
   */
export async function handlePurchase(): Promise<void> {
  try {
    const form  = new FormData();
    if (user) {
      form.append("username", user);
    } else {
      throw new Error("User is not logged in");
    }
    form.append("product_id", String(productId));

    const response: Response = await fetch("/purchase", {
      method: "POST",
      body: form
    });

    if (!response.ok) {
      throw new Error("Purchase failed");
    }

    const data: purchaseFields = await response.json();

    displaySuccessMessage(`Purchase successful! Order number: ${data.confirmationCode}`);

    updateStockDisplay();

    id('account-section').classList.add('hidden');

  } catch (err) {
    showError('product', 'Purchase failed. Please try again.', false);
    throw err;
  }
}

    /**
   * Updates the stock display for a product after a purchase.
   * @param {string} productId - The product ID.
   */
    export function updateStockDisplay(): void {
      const productContainer = document.querySelector(`.single-product-container[data-product-id="${productId}"]`);
      if (productContainer) {
        const stockDiv: HTMLElement = productContainer.querySelector(".product-stock") as HTMLElement;
        if (stockDiv) {
          let stockText: string = stockDiv.textContent || '';
          const match : RegExpMatchArray | null = stockText.match(/\d+/);
          const currentStock: RegExpMatchArray | number= match ? parseInt(match[0]): 0;
          if (currentStock > 0) {
            stockDiv.textContent = `In stock: ${currentStock - 1}`;
          }
        }
      }
    }

     /**
   * Validates payment fields.
   * @param {Object} fields - The payment fields to validate.
   * @param {string} fields.cardHolder - The cardholder name.
   * @param {string} fields.cardNumber - The card number.
   * @param {string} fields.cardExpiry - The card expiry date (in the format MM/YY).
   * @param {string} fields.cardCVV - The card CVV.
   * @param {string} fields.billingAddress - The billing address.
   * @returns {boolean} - Returns true if all fields are valid, false otherwise.
   */
  export function validatePaymentFields(fields: PaymentFields): boolean {
    const { cardHolder, cardNumber, cardExpiry, cardCVV, billingAddress } = fields;

    if (!cardHolder || !cardNumber || !cardExpiry || !cardCVV || !billingAddress) {
      showError('payment', 'Please fill out all payment fields.', false);
      return false;
    }

    if (!validateCardNumber(cardNumber)) {
      showError('payment', 'Please enter a valid 16-digit card number.', false);
      return false;
    }

    if (!validateCardExpiry(cardExpiry)) {
      showError('payment', 'Please enter a valid expiry date (MM/YY).', false);
      return false;
    }

    if (!validateCVV(cardCVV)) {
      showError('payment', 'Please enter a valid 3-digit CVV.', false);
      return false;
    }

    return true;
  }

    /**
   * Validates a card number.
   * @param {string} cardNumber - The card number to validate.
   * @returns {boolean} - Returns true if the card number is valid, false otherwise.
   */
    export function validateCardNumber(cardNumber: string): boolean {
      const cleanNumber: string = cardNumber.replace(/\D/g, '');
      if (cleanNumber.length !== 16) {
        return false;
      }
      return /^\d+$/.test(cleanNumber);
    }

    /**
     * Checks if the expiry date is in the correct format (MM/YY).
     * @param {string} expiry - The expiry date to check.
     * @returns {boolean} - Returns true if the expiry date is in the correct format, false otherwise.
     */
    export function checkExpiryFormat(expiry: string): boolean {
      return /^\d{2}\/\d{2}$/.test(expiry);
    }

    /**
     * Validates a card expiry date.
     * @param {string} expiry - The expiry date to validate (in the format MM/YY).
     * @returns {boolean} - Returns true if the expiry date is valid, false otherwise.
     */
    export function validateCardExpiry(expiry: string): boolean {
      if (!checkExpiryFormat(expiry)) {
        return false;
      }
      const [month, year]: string[] = expiry.split('/');
      return checkExpiryDate(parseInt(month), parseInt(year));
    }

    /**
     * Validates a CVV (Card Verification Value).
     * @param {string} cvv - The CVV to validate.
     * @returns {boolean} - Returns true if the CVV is valid, false otherwise.
     */
    export function validateCVV(cvv: string): boolean {
      return /^\d{3}$/.test(cvv);
    }

    /**
     * Handles input events for the card number field.
     * @param {Event} event - The input event.
     */
   export function handleCardNumberInput(event: Event): void {
      const eventTarget: HTMLInputElement = event.target as HTMLInputElement;
      const value: string = eventTarget.value.replace(/\D/g, '');
      eventTarget.value = value.slice(0, 16);
    }


    /**
     * Checks if an expiry date is valid.
     * @param {number} expiryMonth - The expiry month (1-12).
     * @param {number} year - The expiry year (four-digit year).
     * @returns {boolean} - Returns true if the expiry date is valid, false otherwise.
     */
    export function checkExpiryDate(expiryMonth: number, year: number): boolean {
      const currentDate: Date = new Date();
      const currentFullYear: number = currentDate.getFullYear();
      const currentMonth: number = currentDate.getMonth() + 1;

      // Convert to numbers and add 2000 to get full year
      const expiryYear: number = 2000 + year;
      // Basic validation
      if (expiryMonth < 1 || expiryMonth > 12) {
        return false;
      }
      const maxExpiry: number = 5;
      // Check if card is expired
      if (expiryYear < currentFullYear - maxExpiry) {
        return false;
      }
      if (expiryYear === currentFullYear && expiryMonth > currentMonth) {
        return false;
      }

      if (expiryYear > currentFullYear + 10) {
        return false;
      }
      return true;
    }

    /**
     * Handles input events for the expiry date field.
     * @param {Event} event - The input event.
     */
    export function handleExpiryInput(event: Event): void {
      let eventTarget: HTMLInputElement = event.target as HTMLInputElement;
      let value: string = eventTarget.value.replace(/\D/g, '');
      if (value.length >= 2) {
        let month: string = value.slice(0, 2);
        const monthNum: number = parseInt(month);
        if (monthNum > 12) {
          month = '12';
        } else if (monthNum < 1) {
          month = '01';
        } else if (monthNum < 10 && month.length === 2) {
          month = '0' + monthNum;
        }
        value = month + (value.length > 2 ? '/' + value.slice(2, 4): '');
      }
      eventTarget.value = value.slice(0, 5);
    }

    /**
     * Handles input events for the CVV field.
     * @param {Event} event - The input event.
     */
    export function handleCVVInput(event: Event): void {
      let eventTarget: HTMLInputElement = event.target as HTMLInputElement;
      const value: string = eventTarget.value.replace(/\D/g, '');
      eventTarget.value = value.slice(0, 3);
    }

    /**
   * Sets up event listeners for payment input fields.
   */
  export function setupPaymentInputListeners(): void {
    id('card-number').addEventListener('input', handleCardNumberInput);
    id('card-expiry').addEventListener('input', handleExpiryInput);
    id('card-cvv').addEventListener('input', handleCVVInput);
  }

  /**
   * Sets up event listeners and functionality for payment-related elements.
   */
  export async function paymentStuff(): Promise<void> {
    setupPaymentInputListeners();
    id('submit-payment-btn').addEventListener('click', async function() {
      const cardHolder: string = (id('card-holder') as HTMLInputElement).value;
      const cardNumber: string = (id('card-number') as HTMLInputElement).value;
      const cardExpiry: string = (id('card-expiry') as HTMLInputElement).value;
      const cardCVV: string = (id('card-cvv') as HTMLInputElement).value;
      const billingAddress: string = (id('billing-address') as HTMLInputElement).value;
      const fields: PaymentFields = {
        cardHolder: cardHolder.trim(),
        cardNumber: cardNumber.trim(),
        cardExpiry: cardExpiry.trim(),
        cardCVV: cardCVV.trim(),
        billingAddress: billingAddress.trim()
      };

      if (validatePaymentFields(fields)) {
        await handlePaymentSubmission();
      }
    });
  }