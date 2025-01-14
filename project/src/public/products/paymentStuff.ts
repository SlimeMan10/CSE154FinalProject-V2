
import { user } from '../users/user.js'
import { showError, displaySuccessMessage } from '../extraFunctions/events.js';
import { id } from '../extraFunctions/extra.js';
import { hideTransactions, clearPaymentForm } from './transactionForm.js';

export let productId: number | null= null;
/**
   * Handles the submission of a payment.
   * @throws {Error} - Throws an error if the purchase fails.
   */
export async function handlePaymentSubmission() : Promise<void> {
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
async function handlePurchase() : Promise<void> { {
  try {
    const form  = new FormData();
    if (user) {
      form.append("username", user);
    } else {
      throw new Error("User is not logged in");
    }
    form.append("product_id", String(productId));

    const response : Response = await fetch("/purchase", {
      method: "POST",
      body: form
    });

    if (!response.ok) {
      throw new Error("Purchase failed");
    }

    const data : purchaseFields = await response.json();

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
    function updateStockDisplay() {
      const productContainer = document.querySelector(`.single-product-container[data-product-id="${productId}"]`);
      if (productContainer) {
        const stockDiv = productContainer.querySelector(".product-stock");
        if (stockDiv) {
          const currentStock = parseInt(stockDiv.textContent.match(/\d+/)[0]);
          if (currentStock > 0) {
            stockDiv.textContent = `In stock: ${currentStock - 1}`;
          }
        }
      }
    }