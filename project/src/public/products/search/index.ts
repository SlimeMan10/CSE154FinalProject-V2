import { id, qs, gen } from '../extraFunctions/extra.js';
import { showError } from '../extraFunctions/events.js';
import { Product } from '../types/index.js';
import { hideTransactions, renderProduct } from '../displays';

/**
   * Displays all products based on the provided search terms.
   */
 export async function displayAllWithSearchTerms(): Promise<void> {
  const searchInput: string | null = (qs('#search-bar .search-input') as HTMLInputElement)?.value.trim() || null;
  const maxPrice: string | null= (id('max-price') as HTMLInputElement)?.value.trim() || null;
  const category: string | null = (id('category') as HTMLSelectElement)?.value || null;

  try {
    let queryParams: string[] = [];
    if (searchInput) {
      queryParams.push('name=' + encodeURIComponent(searchInput));
    }
    if (maxPrice) {
      queryParams.push('maxPrice=' + encodeURIComponent(maxPrice));
    }
    if (category) {
      queryParams.push('type=' + encodeURIComponent(category));
    }

    const queryString: string = '/getProducts?' + queryParams.join('&');
    const response: Response = await fetch(queryString);

    if (!response.ok) {
      throw new Error("Could not fetch products");
    }
    await displayTermsResponse(response, searchInput, maxPrice, category);
  } catch (err) {
    showError('product', 'Failed to fetch products. Please try again later.', false);
  }
}



export async function displayTermsResponse(response: Response, searchInput: string | null, maxPrice: string | null, category: string | null): Promise<void> {
  let result: Product[] = await response.json();
    id('product-area').classList.remove('hidden');
    id('all-products').classList.remove('hidden');
    id('main-item-section').classList.remove('hidden');
    id('account-section').setAttribute('hidden', '');
    id('product-area').innerHTML = '';
    let searchTitle: string = 'Results';
    if (searchInput) searchTitle += ` for "${searchInput}"`;
    if (maxPrice) searchTitle += ` under $${maxPrice}`;
    if (category) searchTitle += ` in ${category}`;
    id('all-products').textContent = searchTitle;

    if (result.length === 0) {
      const noProductsDiv: HTMLElement  = gen('div');
      noProductsDiv.textContent = 'No products found.';
      noProductsDiv.classList.add('no-products-message');
      id('product-area').appendChild(noProductsDiv);
    } else {
      result.forEach(card => {
        let name: string = card.name;
        let price: number = card.price;
        let averageReview: number = card.average_rating || 0;
        renderProduct(name, price, averageReview);
      });
    }
}

