  /**
   * Retrieves an element by its ID.
   * @param {string} item - The ID of the element.
   * @returns {HTMLElement} - The element with the specified ID.
   */
  export function id(item: string): HTMLElement | never {
    const element = document.getElementById(item);
    if (!element) {
      throw new Error(`Element with ID "${item}" not found`);
    }
    return element as HTMLElement;
  }

  /**
   * Retrieves the first element that matches the specified CSS selector.
   * @param {string} item - The CSS selector.
   * @returns {HTMLElement} - The first element that matches the selector.
   */
  export function qs(item: string): HTMLElement | never {
    const element = document.querySelector(item);
    if (!element) {
      throw new Error(`Element matching selector "${item}" not found`);
    }
    return element as HTMLElement;
  }

  /**
   * Creates a new element with the specified tag name.
   * @param {string} item - The tag name of the element to create.
   * @returns {HTMLElement} - The newly created element.
   */
  export function gen(item: string) : HTMLElement {
    return document.createElement(item) as HTMLElement;
  }