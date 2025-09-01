/**
 * Pagination Manager
 * Handles pagination functionality for transaction lists
 * @module PaginationManager
 */

import logger from './logger.js';
import { CONSTANTS } from './constants.js';

/**
 * Manager class for pagination operations
 * Handles page navigation and data slicing for large datasets
 */
export class PaginationManager {
    /**
     * Constructor
     * @param {UIManager} uiManager - UI manager instance
     */
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.currentPage = CONSTANTS.PAGINATION.DEFAULT_PAGE;
        this.itemsPerPage = CONSTANTS.PAGINATION.TRANSACTIONS_PER_PAGE;
        this.totalItems = 0;
        this.totalPages = 0;
        this.data = [];
        this.onPageChangeCallback = null;
    }

    /**
     * Initialize pagination with data
     * @param {Array} data - Data array to paginate
     * @param {Function} onPageChangeCallback - Callback function for page changes
     */
    initialize(data, onPageChangeCallback = null) {
        try {
            if (!Array.isArray(data)) {
                logger.error('Invalid data provided to pagination');
                return;
            }

            this.data = data;
            this.totalItems = data.length;
            this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
            this.currentPage = CONSTANTS.PAGINATION.DEFAULT_PAGE;
            this.onPageChangeCallback = onPageChangeCallback;

            logger.info(`Pagination initialized: ${this.totalItems} items, ${this.totalPages} pages`);

            this.updateUI();

        } catch (error) {
            logger.error('Failed to initialize pagination:', error);
        }
    }

    /**
     * Get current page data
     * @returns {Array} Current page data slice
     */
    getCurrentPageData() {
        if (!Array.isArray(this.data) || this.data.length === 0) {
            return [];
        }

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.totalItems);

        return this.data.slice(startIndex, endIndex);
    }

    /**
     * Navigate to specific page
     * @param {number} pageNumber - Page number to navigate to
     */
    goToPage(pageNumber) {
        try {
            const page = parseInt(pageNumber, 10);
            
            if (isNaN(page) || page < 1 || page > this.totalPages) {
                logger.warn(`Invalid page number: ${pageNumber}`);
                return;
            }

            if (page === this.currentPage) {
                logger.info('Already on requested page');
                return;
            }

            const previousPage = this.currentPage;
            this.currentPage = page;

            logger.info(`Navigated from page ${previousPage} to page ${page}`);

            this.updateUI();
            
            // Execute callback if provided
            if (this.onPageChangeCallback && typeof this.onPageChangeCallback === 'function') {
                this.onPageChangeCallback(this.currentPage, this.getCurrentPageData());
            }

        } catch (error) {
            logger.error('Failed to navigate to page:', error);
        }
    }

    /**
     * Navigate to next page
     */
    goToNextPage() {
        if (this.hasNextPage()) {
            this.goToPage(this.currentPage + 1);
        } else {
            logger.info('Already on last page');
        }
    }

    /**
     * Navigate to previous page
     */
    goToPreviousPage() {
        if (this.hasPreviousPage()) {
            this.goToPage(this.currentPage - 1);
        } else {
            logger.info('Already on first page');
        }
    }

    /**
     * Navigate to first page
     */
    goToFirstPage() {
        this.goToPage(1);
    }

    /**
     * Navigate to last page
     */
    goToLastPage() {
        this.goToPage(this.totalPages);
    }

    /**
     * Check if there is a next page
     * @returns {boolean} True if next page exists
     */
    hasNextPage() {
        return this.currentPage < this.totalPages;
    }

    /**
     * Check if there is a previous page
     * @returns {boolean} True if previous page exists
     */
    hasPreviousPage() {
        return this.currentPage > 1;
    }

    /**
     * Get pagination information
     * @returns {Object} Pagination info object
     */
    getPaginationInfo() {
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);

        return {
            currentPage: this.currentPage,
            totalPages: this.totalPages,
            totalItems: this.totalItems,
            itemsPerPage: this.itemsPerPage,
            startItem: this.totalItems > 0 ? startItem : 0,
            endItem: this.totalItems > 0 ? endItem : 0,
            hasNextPage: this.hasNextPage(),
            hasPreviousPage: this.hasPreviousPage()
        };
    }

    /**
     * Update pagination UI elements
     * @private
     */
    updateUI() {
        try {
            const info = this.getPaginationInfo();

            // Update page info text
            this.uiManager.updatePaginationInfo(info.currentPage, info.totalPages);

            // Update navigation buttons
            this.updateNavigationButtons(info);

            // Show/hide pagination controls based on total pages
            if (info.totalPages <= 1) {
                this.uiManager.hidePaginationControls();
            } else {
                this.uiManager.showPaginationControls();
            }

            logger.debug('Pagination UI updated:', info);

        } catch (error) {
            logger.error('Failed to update pagination UI:', error);
        }
    }

    /**
     * Update navigation button states
     * @param {Object} info - Pagination info object
     * @private
     */
    updateNavigationButtons(info) {
        const prevButton = document.getElementById('prevPage');
        const nextButton = document.getElementById('nextPage');

        if (prevButton) {
            prevButton.disabled = !info.hasPreviousPage;
            prevButton.classList.toggle(CONSTANTS.CSS_CLASSES.DISABLED, !info.hasPreviousPage);
        }

        if (nextButton) {
            nextButton.disabled = !info.hasNextPage;
            nextButton.classList.toggle(CONSTANTS.CSS_CLASSES.DISABLED, !info.hasNextPage);
        }
    }

    /**
     * Set items per page
     * @param {number} itemsPerPage - Number of items per page
     */
    setItemsPerPage(itemsPerPage) {
        try {
            const items = parseInt(itemsPerPage, 10);
            
            if (isNaN(items) || items < 1) {
                logger.warn('Invalid items per page value:', itemsPerPage);
                return;
            }

            this.itemsPerPage = items;
            this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
            
            // Adjust current page if necessary
            if (this.currentPage > this.totalPages) {
                this.currentPage = Math.max(1, this.totalPages);
            }

            logger.info(`Items per page updated to: ${this.itemsPerPage}`);
            this.updateUI();

        } catch (error) {
            logger.error('Failed to set items per page:', error);
        }
    }

    /**
     * Reset pagination to first page
     */
    reset() {
        this.currentPage = CONSTANTS.PAGINATION.DEFAULT_PAGE;
        this.updateUI();
        logger.info('Pagination reset to first page');
    }

    /**
     * Update data and refresh pagination
     * @param {Array} newData - New data array
     */
    updateData(newData) {
        if (!Array.isArray(newData)) {
            logger.error('Invalid data provided to updateData');
            return;
        }

        this.data = newData;
        this.totalItems = newData.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        
        // Reset to first page if current page is invalid
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = 1;
        } else if (this.totalPages === 0) {
            this.currentPage = 1;
        }

        logger.info(`Pagination data updated: ${this.totalItems} items, ${this.totalPages} pages`);
        this.updateUI();

        // Trigger callback if provided
        if (this.onPageChangeCallback && typeof this.onPageChangeCallback === 'function') {
            this.onPageChangeCallback(this.currentPage, this.getCurrentPageData());
        }
    }

    /**
     * Get page numbers for pagination controls
     * @param {number} maxVisible - Maximum number of page numbers to show
     * @returns {Array} Array of page numbers to display
     */
    getVisiblePageNumbers(maxVisible = 5) {
        if (this.totalPages <= maxVisible) {
            return Array.from({ length: this.totalPages }, (_, i) => i + 1);
        }

        const half = Math.floor(maxVisible / 2);
        let start = Math.max(1, this.currentPage - half);
        let end = Math.min(this.totalPages, start + maxVisible - 1);

        // Adjust start if we're near the end
        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }

    /**
     * Check if pagination is needed
     * @returns {boolean} True if pagination controls should be shown
     */
    isPaginationNeeded() {
        return this.totalPages > 1;
    }

    /**
     * Get current pagination state
     * @returns {Object} Current state object
     */
    getCurrentState() {
        return {
            currentPage: this.currentPage,
            itemsPerPage: this.itemsPerPage,
            totalItems: this.totalItems,
            totalPages: this.totalPages,
            hasData: this.data.length > 0
        };
    }
}
