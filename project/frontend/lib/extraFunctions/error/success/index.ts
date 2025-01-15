import { id, gen } from './extra.js';

  /**
     * Shows an error message or success message.
     * @param {string} containerId - The ID of the container element.
     * @param {string} message - The error or success message.
     * @param {boolean} isSuccess - Indicates whether it is a success message (true) or an error message (false).
     */
  export function showError(containerId : string, message: string, isSuccess: boolean) : void {
    const errorDiv : HTMLElement = id(`${containerId}-error`);
    errorDiv.classList.remove('hidden');
    errorDiv.textContent = message;
    if (isSuccess) {
      errorDiv.classList.add('success-state');
    } else {
      errorDiv.classList.remove('success-state');
    }
  }

  /**
   * Clears the error message for a specific container.
   * @param {string} containerId - The ID of the container element.
   */
  export function clearError(containerId : string) : void {
    const errorDiv : HTMLElement = id(`${containerId}-error`);
    errorDiv.classList.add('hidden');
    errorDiv.textContent = '';
  }

    /**
   * Displays a success message.
   * @param {string} message - The success message to display.
   */
    export function displaySuccessMessage(message : string) : void {
      const oldMessage : HTMLElement = id('global-success-message');
      if (oldMessage) {
        oldMessage.remove();
      }
      const successDiv : HTMLElement = gen('div');
      successDiv.id = 'global-success-message';
      successDiv.className = 'success-message';
      successDiv.textContent = message;

      const mainSection : HTMLElement = id('main-item-section');
      if (mainSection.parentNode) {
        mainSection.parentNode.insertBefore(successDiv, mainSection.nextSibling);
      }
    }