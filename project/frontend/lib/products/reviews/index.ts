import { showError } from '../extraFunctions/extra.js';
import { user } from '../users/user.js'
import { showProduct} from '../product/displays/index.js'
import { gen, id } from '../extraFunctions/extra.js'
import { Product } from '../types/index.js'

 /**
   * Handles the submission of a product review.
   * @param {string} productId - The product ID.
   * @param {string} rating - The selected rating value.
   */
 export async function handleReviewSubmission(productId: number, rating: string): Promise<void>{
  try {
    const formData = new FormData();
    formData.append('product_id', String(productId));
    formData.append('rating', rating);
    formData.append('username', user);

    let response: Response= await fetch('/review', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      showError('review', 'Failed to submit review', false);
    } else {
      showError('review', 'Review submitted successfully!', true);
      const productResponse: Response = await fetch('/getProducts?product_id=' + productId);
      if (productResponse.ok) {
        const productData: Product = await productResponse.json();
        if (productData && productData[0]) {
          showProduct(productData[0].name);
        }
      }
    }
  } catch (err) {
    showError('review', 'Failed to submit review. Please try again.', false);
  }
}

/**
   * Creates a review section element.
   * @param {number} productId - The product ID.
   * @returns {HTMLElement} - The created review section element.
   */
export function createReviewSection(productId: number): HTMLElement {
  const reviewDiv: HTMLElement = gen('div');
  reviewDiv.className = 'review-section';
  const select: HTMLElement = createRatingSelect();
  const submitReview: HTMLElement = createReviewButton(productId, select);
  const errorDiv: HTMLElement = createErrorDiv();
  reviewDiv.appendChild(select);
  reviewDiv.appendChild(submitReview);
  reviewDiv.appendChild(errorDiv);
  return reviewDiv;
}

/**
 * Creates a rating select element.
 * @returns {HTMLElement} - The created rating select element.
 */
export function createRatingSelect(): HTMLElement {
  const select: HTMLElement = gen('select');
  select.id = 'rating';
  const defaultOption: HTMLOptionElement = gen('option') as HTMLOptionElement;
  defaultOption.value = '';
  defaultOption.textContent = 'Rate Product';
  select.appendChild(defaultOption);
  for(let i = 1; i <= 5; i++) {
    const option: HTMLOptionElement= gen('option') as HTMLOptionElement;
    option.value = i.toString();
    option.textContent = `${i} Star${i > 1 ? 's': ''}`;
    select.appendChild(option);
  }
  return select;
}

/**
 * Creates a review button element.
 * @param {number} productId - The product ID.
 * @param {HTMLElement} select - The rating select element.
 * @returns {HTMLElement} - The created review button element.
 */
export function createReviewButton(productId: number, select: HTMLElement): HTMLElement{
  const submitReview: HTMLElement = gen('button');
  submitReview.textContent = 'Submit Review';
  submitReview.className = 'review-button';
  submitReview.addEventListener('click', function() {
    if (!user) {
      showError('review', 'Please login to submit a review', false);
    } else {
      const rating: string | null = (select as HTMLSelectElement).value;
      if (!rating) {
        showError('review', 'Please select a rating', false);
      } else {
        handleReviewSubmission(productId, rating);
      }
    }
  });
  return submitReview;
}

  /**
   * Creates an error div element.
   * @returns {HTMLElement} - The created error div element.
   */
  function createErrorDiv(): HTMLElement {
    const errorDiv: HTMLElement = gen('div');
    errorDiv.id = 'review-error';
    errorDiv.className = 'error-message hidden';
    return errorDiv;
  }

