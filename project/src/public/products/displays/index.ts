import { id, gen, qs } from '../extraFunctions/extra.js';
import { Product } from '../types/index.js';
import { showError } from '../extraFunctions/events.js';
import { clearError } from '../extraFunctions/events.js';
import { Order } from '../types/index.js';
import { createReviewSection } from './reviews/index.js';
import { user } from '../users/user.js';

export let currentProductId : number | null = null;

  /**
   * Displays a message indicating no previous orders.
   */
  function displayNoOrders() {
    const transactionContent = id('transaction-content');
    transactionContent.innerHTML = '';

    const heading = createPurchaseHeading();
    transactionContent.appendChild(heading);

    const noOrdersDiv = gen('div');
    noOrdersDiv.textContent = 'No previous orders found.';
    noOrdersDiv.classList.add('no-products-message');
    transactionContent.appendChild(noOrdersDiv);

    // Show the transaction area
    id('transaction-area').classList.remove('hidden');
  }

       /**
   * Shows the details of a specific product.
   * @param {string} productName - The name of the product to display.
   */
       export async function showProduct(productName : string): Promise<void> {
        try {
          const response : Response= await fetch('/getProducts?name=' + productName);
          if (!response.ok) {
            throw new Error("Could not find product");
          }
          const data : Product[] = await response.json();
          displayProduct(data);
        } catch(err) {
          showError('product', 'Failed to load product details.', false);
        }
      }

        /**
   * Displays a single product's details.
   * @param {Object} item - The product data.
   */
    export function displayProduct(item : Product[]) : void {
      const data : Product = item[0];
      setupProductDisplay();
      const singleProductContainer = createProductContainer(data);
      id("product-area").appendChild(singleProductContainer);
    }

      /**
   * Sets up the product display area.
   */
  export function setupProductDisplay() : void {
    id("all-products").classList.add('hidden');
    const productArea : HTMLElement = id("product-area");
    productArea.innerHTML = '';
    productArea.classList.remove('hidden');
  }

      /**
   * Renders a product card.
   * @param {string} productName - The product name.
   * @param {number} price - The product price.
   * @param {number} averageReviews - The average review rating.
   */
      export function renderProduct(productName : string, price: number, averageReviews: number) : void {
        const productArea : HTMLElement = id('product-area');
        const productCard : HTMLElement= gen('div');
        productCard.className = 'product-card';

        let image : HTMLElement= createImage(productName);
        let nameDiv : HTMLElement = createNameDiv(productName);
        let starsDiv : HTMLElement = createStarDiv(averageReviews);
        let priceDiv : HTMLElement = createPriceDiv(price);
        productCard.addEventListener('click', function() {
          showProduct(productName);
        });
        productCard.appendChild(image);
        productCard.appendChild(nameDiv);
        productCard.appendChild(starsDiv);
        productCard.appendChild(priceDiv);
        productArea.appendChild(productCard);
      }

      /**
   * Displays the user's previous transactions.
   * @param {Order} data - The transaction data.
   * @param {HTMLElement} list - The transaction list element.
   */
  export function displayPreviousTransactions(data: Order, list: HTMLElement) {
    // Get the transaction content container
    const transactionContent = id('transaction-content');
    transactionContent.innerHTML = ''; // Clear existing content

    // Create and append heading
    const heading = createPurchaseHeading();
    transactionContent.appendChild(heading);

    // Add transaction list
    list.classList.add('transaction-list');

    // Show the transaction area first - moved outside of blocks
    id('transaction-area').classList.remove('hidden');

    if (data.length === 0) {
      displayNoOrders();
    } else {
      for (let i = 0; i < data.length; i++) {
        let order = data[i];
        const orderDiv = createOrderDiv(order);

        // Create order ID div and append it to orderDiv
        const orderId = gen('div');
        orderId.className = 'transaction-id';
        orderId.textContent = `Order ID: ${order.order_id}`;
        orderDiv.appendChild(orderId);
        orderDiv.appendChild(createImage(order.name));

        // Append other elements to orderDiv
        orderDiv.appendChild(createProductName(order));
        orderDiv.appendChild(createProductDescription(order));
        orderDiv.appendChild(createProductPrice(order));

        // Append completed orderDiv to list
        list.appendChild(orderDiv);
      }
      // Append the list to transaction content
      id('transaction-content').appendChild(list);
    }
  }

  /**
   * Creates a product price div element for a transaction.
   * @param {Order} order - The order data.
   * @returns {HTMLElement} - The created product price div element.
   */
  export function createProductPrice(order: Order) {
    const price = gen('div');
    price.className = 'transaction-price';
    price.textContent = `Price: $${order.price}`;
    return price;
  }

  /**
   * Creates a product description div element for a transaction.
   * @param {Object} order - The order data.
   * @returns {HTMLElement} - The created product description div element.
   */
  export function createProductDescription(order : Order) {
    const description = gen('div');
    description.className = 'transaction-description';
    description.textContent = `Description: ${order.description}`;
    return description;
  }

  /**
   * Creates a product name div element for a transaction.
   * @param {Object} order - The order data.
   * @returns {HTMLElement} - The created product name div element.
   */
  export function createProductName(order : Order) {
    const productName = gen('div');
    productName.className = 'transaction-name';
    productName.textContent = `Product: ${order.name}`;
    return productName;
  }

  /**
   * Creates an order div element for a transaction.
   * @param {Object} order - The order data.
   * @returns {HTMLElement} - The created order div element.
   */
  export function createOrderDiv(order : Order) {
    const orderDiv = gen('div');
    orderDiv.className = 'transaction-item';
    orderDiv.setAttribute('data-order-id', order.order_id);
    return orderDiv;
  }

  /**
   * Creates a purchase heading element.
   * @returns {HTMLElement} - The created purchase heading element.
   */
  export function createPurchaseHeading() {
    const heading = gen('h3');
    heading.textContent = 'Purchase History';
    return heading;
  }

  /**
   * Appends product details (description, price, stock, rating) to a product container.
   * @param {HTMLElement} container - The product container element.
   * @param {Product} data - The product data.
   */
  export function appendProductDetails(container : HTMLElement, data: Product) {
    const descriptionDiv : HTMLElement = createDescriptionDiv(String(data.description));
    const priceDiv : HTMLElement= createPriceDiv(Number(data.price));
    const stockDiv : HTMLElement= createStockDiv(String(data.stock));
    const ratingDiv : HTMLElement = createStarDiv(Number(data.average_rating));

    container.appendChild(descriptionDiv);
    container.appendChild(priceDiv);
    container.appendChild(stockDiv);
    container.appendChild(ratingDiv);
  }

    /**
 * Creates a description div element.
 * @param {string} description - The product description.
 * @returns {HTMLElement} - The created description div element.
 */
export function createDescriptionDiv(description : string) : HTMLElement {
  const descriptionDiv = gen('div');
  descriptionDiv.className = 'product-description';
  descriptionDiv.textContent = description;
  return descriptionDiv;
}

/**
 * Creates a stock div element.
 * @param {number} stock - The product stock quantity.
 * @returns {HTMLElement} - The created stock div element.
 */
export function createStockDiv(stock : string) : HTMLElement {
  const stockDiv = gen('div');
  stockDiv.className = 'product-stock';
  stockDiv.textContent = `In stock: ${stock}`;
  return stockDiv;
}

  /**
 * Creates a price div element for a product card.
 * @param {number} price - The product price.
 * @returns {HTMLElement} - The created price div element.
 */
  export function createPriceDiv(price : number) : HTMLElement {
    const priceDiv : HTMLElement = gen('div');
    priceDiv.className = 'price';
    priceDiv.textContent = `From $${price} USD`;
    return priceDiv;
  }

    /**
 * Creates a star rating div element for a product card.
 * @param {number} averageReviews - The average review rating.
 * @returns {HTMLElement} - The created star rating div element.
 */
export function createStarDiv(averageReviews : number) {
  const starsDiv = gen('div');
  starsDiv.className = 'stars';
  const starCount = Math.floor(averageReviews);
  const starEmoji = '⭐';
  const starsText = (averageReviews - starCount >= 0.5) ?
      starEmoji.repeat(starCount) + "✨" : starEmoji.repeat(starCount);
  starsDiv.textContent = starsText;
  return starsDiv;
}

/**
   * Creates a name div element for a product card.
   * @param {string} productName - The product name.
   * @returns {HTMLElement} - The created name div element.
   */
export function createNameDiv(productName : string) : HTMLElement{
  const nameDiv = gen('div');
  nameDiv.className = 'product-name';
  const formattedName = productName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  nameDiv.textContent = formattedName;
  return nameDiv;
}

/**
 * Creates an image element for a product card.
 * @param {string} productName - The product name.
 * @returns {HTMLElement} - The created image element.
 */
export function createImage(productName : string) : HTMLImageElement{
  const imgName : string = productName.toLowerCase().replace(/\s+/g, '-');
  const img : HTMLImageElement = gen('img') as HTMLImageElement;
  img.src = `./imgs/${imgName}.jpg`;
  img.alt = productName;
  img.className = 'product-image';
  return img;
}

/**
 * Creates a container element for a single product.
 * @param {Product} data - The product data.
 * @returns {HTMLElement} - The created product container element.
 */
export function createProductContainer(data: Product) : HTMLElement {
  const singleProductContainer : HTMLElement= gen('div');
  singleProductContainer.className = 'single-product-container';
  singleProductContainer.setAttribute('data-product-id', String(data.product_id));

  appendBasicInfo(singleProductContainer, data);
  appendProductDetails(singleProductContainer, data);
  appendInteractionButtons(singleProductContainer, data);

  return singleProductContainer;
}

/**
 * Appends basic information (image and name) to a product container.
 * @param {HTMLElement} container - The product container element.
 * @param {Product} data - The product data.
 */
export function appendBasicInfo(container : HTMLElement, data: Product) : void {
  const img : HTMLElement = createImage(data.name);
  const nameDiv : HTMLElement = createNameDiv(data.name);
  container.appendChild(img);
  container.appendChild(nameDiv);
}

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

      /**
   * Displays all products.
   */
  export async function displayAllProducts() : Promise<void> {
    try {
      const response : Response = await fetch('/getAllProducts');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      let result : Product[] = await response.json();
      result.forEach(card => {
        let name : string = card.name;
        let price : number = card.price;
        let averageReview : number = card.average_rating;
        renderProduct(name, price, averageReview);
      });
    } catch (err: unknown) {
      showError('product', 'Failed to load products. Please try again later.', false);
    }
  }

  /**
   * Appends interaction buttons (buy button and review section) to a product container.
   * @param {HTMLElement} container - The product container element.
   * @param {product} data - The product data.
   */
  export function appendInteractionButtons(container : HTMLElement, data : Product) : void {
    const buyButton = createBuyButton(data.product_id, data.price);
    const reviewSection = createReviewSection(String(data.product_id));
    container.appendChild(buyButton);
    container.appendChild(reviewSection);
  }

  /**
   * Creates a buy button element.
   * @param {string} productId - The product ID.
   * @param {number} price - The product price.
   * @returns {HTMLElement} - The created buy button element.
   */
  export function createBuyButton(productId : number, price : number) : HTMLElement {
    const buyButton : HTMLElement = gen('button');
    buyButton.textContent = 'Buy';
    buyButton.className = 'buy-button';
    buyButton.addEventListener('click', function() {
      if (!user) {
        showError('product', 'Please login to make a purchase', false);
      } else {
        currentProductId = productId;
        id('product-area').classList.add('hidden');
        id('all-products').classList.add('hidden');
        id('main-item-section').classList.add('hidden');
        id('payment-section').classList.remove('hidden');
      }
    });
    return buyButton;
  }