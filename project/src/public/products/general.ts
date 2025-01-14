import { id, gen, qs } from '../extraFunctions/extra.js';
import { Product } from '../objects/types.js';
import { showError } from '../extraFunctions/events.js';

export let productId : number | null = null;

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
   * Appends product details (description, price, stock, rating) to a product container.
   * @param {HTMLElement} container - The product container element.
   * @param {Product} data - The product data.
   */
    function appendProductDetails(container : HTMLElement, data: Product) {
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
