/**
 * UI Manager
 * Handles all user interface operations and DOM manipulation
 * @module UIManager
 */

import logger from './logger.js';
import { CONSTANTS } from './constants.js';

/**
 * Manager class for UI operations
 * Centralizes DOM manipulation and UI state management
 */
export class UIManager {
    constructor() {
        this.elements = {};
        this.cacheElements();
    }

    /**
     * Cache frequently used DOM elements
     * @private
     */
    cacheElements() {
        try {
            this.elements = {
                loadingState: document.getElementById('loadingState'),
                errorState: document.getElementById('errorState'),
                mainContent: document.getElementById('mainContent'),
                customerSummary: document.getElementById('customerSummary'),
                monthlyBreakdown: document.getElementById('monthlyBreakdown'),
                transactionDetails: document.getElementById('transactionDetails'),
                noDataState: document.getElementById('noDataState'),
                paginationControls: document.getElementById('paginationControls'),
                pageInfo: document.getElementById('pageInfo'),
                totalPoints: document.getElementById('totalPoints'),
                selectedPeriod: document.getElementById('selectedPeriod'),
                totalTransactions: document.getElementById('totalTransactions'),
                prevPage: document.getElementById('prevPage'),
                nextPage: document.getElementById('nextPage')
            };

            logger.info('UI elements cached successfully');

        } catch (error) {
            logger.error('Failed to cache UI elements:', error);
        }
    }

    /**
     * Show an element by removing hidden class
     * @param {string|HTMLElement} elementOrId - Element or element ID
     */
    showElement(elementOrId) {
        try {
            const element = this.getElement(elementOrId);
            if (element) {
                element.classList.remove(CONSTANTS.CSS_CLASSES.HIDDEN);
                logger.debug(`Showing element: ${elementOrId}`);
            }
        } catch (error) {
            logger.error(`Failed to show element ${elementOrId}:`, error);
        }
    }

    /**
     * Hide an element by adding hidden class
     * @param {string|HTMLElement} elementOrId - Element or element ID
     */
    hideElement(elementOrId) {
        try {
            const element = this.getElement(elementOrId);
            if (element) {
                element.classList.add(CONSTANTS.CSS_CLASSES.HIDDEN);
                logger.debug(`Hiding element: ${elementOrId}`);
            }
        } catch (error) {
            logger.error(`Failed to hide element ${elementOrId}:`, error);
        }
    }

    /**
     * Toggle element visibility
     * @param {string|HTMLElement} elementOrId - Element or element ID
     */
    toggleElement(elementOrId) {
        try {
            const element = this.getElement(elementOrId);
            if (element) {
                element.classList.toggle(CONSTANTS.CSS_CLASSES.HIDDEN);
                logger.debug(`Toggling element: ${elementOrId}`);
            }
        } catch (error) {
            logger.error(`Failed to toggle element ${elementOrId}:`, error);
        }
    }

    /**
     * Show loading state
     */
    showLoadingState() {
        this.showElement('loadingState');
        this.hideElement('mainContent');
        this.hideElement('errorState');
        logger.info('Loading state displayed');
    }

    /**
     * Show error state with message
     * @param {string} message - Error message to display
     */
    showErrorState(message = 'An error occurred') {
        this.hideElement('loadingState');
        this.hideElement('mainContent');
        this.showElement('errorState');
        
        const errorMessageElement = document.getElementById('errorMessage');
        if (errorMessageElement) {
            errorMessageElement.textContent = message;
        }
        
        logger.info('Error state displayed with message:', message);
    }

    /**
     * Show main content
     */
    showMainContent() {
        this.hideElement('loadingState');
        this.hideElement('errorState');
        this.showElement('mainContent');
        logger.info('Main content displayed');
    }

    /**
     * Show customer summary section
     */
    showCustomerSummary() {
        this.showElement('customerSummary');
        logger.debug('Customer summary section shown');
    }

    /**
     * Hide customer summary section
     */
    hideCustomerSummary() {
        this.hideElement('customerSummary');
        logger.debug('Customer summary section hidden');
    }

    /**
     * Show monthly breakdown section
     */
    showMonthlyBreakdown() {
        this.showElement('monthlyBreakdown');
        logger.debug('Monthly breakdown section shown');
    }

    /**
     * Hide monthly breakdown section
     */
    hideMonthlyBreakdown() {
        this.hideElement('monthlyBreakdown');
        logger.debug('Monthly breakdown section hidden');
    }

    /**
     * Show transaction details section
     */
    showTransactionDetails() {
        this.showElement('transactionDetails');
        logger.debug('Transaction details section shown');
    }

    /**
     * Hide transaction details section
     */
    hideTransactionDetails() {
        this.hideElement('transactionDetails');
        logger.debug('Transaction details section hidden');
    }

    /**
     * Show no data state
     */
    showNoDataState() {
        this.showElement('noDataState');
        this.hideCustomerSummary();
        this.hideMonthlyBreakdown();
        this.hideTransactionDetails();
        this.hidePaginationControls();
        logger.info('No data state displayed');
    }

    /**
     * Hide no data state
     */
    hideNoDataState() {
        this.hideElement('noDataState');
        logger.debug('No data state hidden');
    }

    /**
     * Show pagination controls
     */
    showPaginationControls() {
        this.showElement('paginationControls');
        logger.debug('Pagination controls shown');
    }

    /**
     * Hide pagination controls
     */
    hidePaginationControls() {
        this.hideElement('paginationControls');
        logger.debug('Pagination controls hidden');
    }

    /**
     * Update pagination information display
     * @param {number} currentPage - Current page number
     * @param {number} totalPages - Total number of pages
     */
    updatePaginationInfo(currentPage, totalPages) {
        try {
            const pageInfoElement = this.elements.pageInfo;
            if (pageInfoElement) {
                pageInfoElement.textContent = `Page ${currentPage} of ${totalPages}`;
                logger.debug(`Pagination info updated: ${currentPage}/${totalPages}`);
            }
        } catch (error) {
            logger.error('Failed to update pagination info:', error);
        }
    }

    /**
     * Update customer summary values
     * @param {Object} summaryData - Summary data object
     */
    updateCustomerSummary(summaryData) {
        try {
            const { totalPoints, selectedPeriod, totalTransactions } = summaryData;

            if (this.elements.totalPoints && totalPoints !== undefined) {
                this.elements.totalPoints.textContent = totalPoints.toLocaleString();
            }

            if (this.elements.selectedPeriod && selectedPeriod) {
                this.elements.selectedPeriod.textContent = selectedPeriod;
            }

            if (this.elements.totalTransactions && totalTransactions !== undefined) {
                this.elements.totalTransactions.textContent = totalTransactions;
            }

            logger.debug('Customer summary updated:', summaryData);

        } catch (error) {
            logger.error('Failed to update customer summary:', error);
        }
    }

    /**
     * Set text content of an element
     * @param {string|HTMLElement} elementOrId - Element or element ID
     * @param {string} text - Text content to set
     */
    setText(elementOrId, text) {
        try {
            const element = this.getElement(elementOrId);
            if (element) {
                element.textContent = text || '';
                logger.debug(`Text updated for ${elementOrId}: ${text}`);
            }
        } catch (error) {
            logger.error(`Failed to set text for ${elementOrId}:`, error);
        }
    }

    /**
     * Set HTML content of an element
     * @param {string|HTMLElement} elementOrId - Element or element ID
     * @param {string} html - HTML content to set
     */
    setHTML(elementOrId, html) {
        try {
            const element = this.getElement(elementOrId);
            if (element) {
                element.innerHTML = html || '';
                logger.debug(`HTML updated for ${elementOrId}`);
            }
        } catch (error) {
            logger.error(`Failed to set HTML for ${elementOrId}:`, error);
        }
    }

    /**
     * Add CSS class to an element
     * @param {string|HTMLElement} elementOrId - Element or element ID
     * @param {string} className - CSS class to add
     */
    addClass(elementOrId, className) {
        try {
            const element = this.getElement(elementOrId);
            if (element && className) {
                element.classList.add(className);
                logger.debug(`Added class '${className}' to ${elementOrId}`);
            }
        } catch (error) {
            logger.error(`Failed to add class to ${elementOrId}:`, error);
        }
    }

    /**
     * Remove CSS class from an element
     * @param {string|HTMLElement} elementOrId - Element or element ID
     * @param {string} className - CSS class to remove
     */
    removeClass(elementOrId, className) {
        try {
            const element = this.getElement(elementOrId);
            if (element && className) {
                element.classList.remove(className);
                logger.debug(`Removed class '${className}' from ${elementOrId}`);
            }
        } catch (error) {
            logger.error(`Failed to remove class from ${elementOrId}:`, error);
        }
    }

    /**
     * Toggle CSS class on an element
     * @param {string|HTMLElement} elementOrId - Element or element ID
     * @param {string} className - CSS class to toggle
     */
    toggleClass(elementOrId, className) {
        try {
            const element = this.getElement(elementOrId);
            if (element && className) {
                element.classList.toggle(className);
                logger.debug(`Toggled class '${className}' on ${elementOrId}`);
            }
        } catch (error) {
            logger.error(`Failed to toggle class on ${elementOrId}:`, error);
        }
    }

    /**
     * Enable or disable an element
     * @param {string|HTMLElement} elementOrId - Element or element ID
     * @param {boolean} enabled - Whether element should be enabled
     */
    setEnabled(elementOrId, enabled) {
        try {
            const element = this.getElement(elementOrId);
            if (element) {
                element.disabled = !enabled;
                
                if (enabled) {
                    this.removeClass(element, CONSTANTS.CSS_CLASSES.DISABLED);
                } else {
                    this.addClass(element, CONSTANTS.CSS_CLASSES.DISABLED);
                }
                
                logger.debug(`Element ${elementOrId} ${enabled ? 'enabled' : 'disabled'}`);
            }
        } catch (error) {
            logger.error(`Failed to set enabled state for ${elementOrId}:`, error);
        }
    }

    /**
     * Create and append an element
     * @param {string} tagName - HTML tag name
     * @param {HTMLElement} parent - Parent element
     * @param {Object} options - Element options (className, textContent, etc.)
     * @returns {HTMLElement} Created element
     */
    createElement(tagName, parent = null, options = {}) {
        try {
            const element = document.createElement(tagName);

            // Set attributes
            if (options.className) {
                element.className = options.className;
            }

            if (options.textContent) {
                element.textContent = options.textContent;
            }

            if (options.innerHTML) {
                element.innerHTML = options.innerHTML;
            }

            if (options.id) {
                element.id = options.id;
            }

            // Set other attributes
            if (options.attributes) {
                Object.entries(options.attributes).forEach(([key, value]) => {
                    element.setAttribute(key, value);
                });
            }

            // Append to parent if provided
            if (parent) {
                parent.appendChild(element);
            }

            logger.debug(`Created element: ${tagName}`);
            return element;

        } catch (error) {
            logger.error(`Failed to create element ${tagName}:`, error);
            return null;
        }
    }

    /**
     * Remove an element from the DOM
     * @param {string|HTMLElement} elementOrId - Element or element ID
     */
    removeElement(elementOrId) {
        try {
            const element = this.getElement(elementOrId);
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
                logger.debug(`Removed element: ${elementOrId}`);
            }
        } catch (error) {
            logger.error(`Failed to remove element ${elementOrId}:`, error);
        }
    }

    /**
     * Clear all child elements from a parent element
     * @param {string|HTMLElement} elementOrId - Parent element or element ID
     */
    clearElement(elementOrId) {
        try {
            const element = this.getElement(elementOrId);
            if (element) {
                while (element.firstChild) {
                    element.removeChild(element.firstChild);
                }
                logger.debug(`Cleared element: ${elementOrId}`);
            }
        } catch (error) {
            logger.error(`Failed to clear element ${elementOrId}:`, error);
        }
    }

    /**
     * Get element from cache or DOM
     * @param {string|HTMLElement} elementOrId - Element or element ID
     * @returns {HTMLElement|null} Element or null if not found
     * @private
     */
    getElement(elementOrId) {
        if (typeof elementOrId === 'string') {
            // Check cache first
            if (this.elements[elementOrId]) {
                return this.elements[elementOrId];
            }
            // Fall back to DOM query
            return document.getElementById(elementOrId);
        }
        
        // Assume it's already an element
        return elementOrId;
    }

    /**
     * Scroll to an element
     * @param {string|HTMLElement} elementOrId - Element or element ID
     * @param {Object} options - Scroll options
     */
    scrollToElement(elementOrId, options = { behavior: 'smooth', block: 'start' }) {
        try {
            const element = this.getElement(elementOrId);
            if (element) {
                element.scrollIntoView(options);
                logger.debug(`Scrolled to element: ${elementOrId}`);
            }
        } catch (error) {
            logger.error(`Failed to scroll to element ${elementOrId}:`, error);
        }
    }

    /**
     * Check if an element exists
     * @param {string|HTMLElement} elementOrId - Element or element ID
     * @returns {boolean} True if element exists
     */
    elementExists(elementOrId) {
        const element = this.getElement(elementOrId);
        return element !== null;
    }

    /**
     * Show temporary message/notification
     * @param {string} message - Message to show
     * @param {string} type - Message type (success, error, warning, info)
     * @param {number} duration - Duration in milliseconds (0 = permanent)
     */
    showMessage(message, type = 'info', duration = 3000) {
        try {
            // Create message element if it doesn't exist
            let messageContainer = document.getElementById('messageContainer');
            
            if (!messageContainer) {
                messageContainer = this.createElement('div', document.body, {
                    id: 'messageContainer',
                    className: 'message-container'
                });
            }

            const messageElement = this.createElement('div', messageContainer, {
                className: `message message-${type}`,
                innerHTML: `
                    <span class="message-text">${message}</span>
                    <button class="message-close" onclick="this.parentElement.remove()">&times;</button>
                `
            });

            // Auto-remove after duration
            if (duration > 0) {
                setTimeout(() => {
                    if (messageElement.parentNode) {
                        messageElement.remove();
                    }
                }, duration);
            }

            logger.info(`Showed ${type} message: ${message}`);

        } catch (error) {
            logger.error('Failed to show message:', error);
        }
    }
}
