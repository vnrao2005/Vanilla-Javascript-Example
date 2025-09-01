/**
 * Filter Manager
 * Handles date and period filtering functionality
 * @module FilterManager
 */

import logger from './logger.js';
import { CONSTANTS } from './constants.js';

/**
 * Manager class for filter operations
 * Handles month/year filtering and date range calculations
 */
export class FilterManager {
    /**
     * Constructor
     * @param {UIManager} uiManager - UI manager instance
     */
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.currentFilters = {
            month: CONSTANTS.FILTERS.DEFAULT_MONTH,
            year: CONSTANTS.FILTERS.DEFAULT_YEAR
        };
        
        this.initializeFilters();
    }

    /**
     * Initialize filter dropdowns with default values
     * @private
     */
    initializeFilters() {
        try {
            logger.info('Initializing filter dropdowns');
            
            this.populateMonthFilter();
            this.populateYearFilter();
            this.setDefaultValues();
            
            logger.info('Filter dropdowns initialized successfully');
            
        } catch (error) {
            logger.error('Failed to initialize filters:', error);
        }
    }

    /**
     * Populate month filter dropdown
     * @private
     */
    populateMonthFilter() {
        const monthSelect = document.getElementById('monthFilter');
        
        if (!monthSelect) {
            logger.error('Month filter element not found');
            return;
        }

        // Clear existing options
        monthSelect.innerHTML = '';

        // Add month options
        CONSTANTS.FILTERS.MONTHS.forEach(month => {
            const option = document.createElement('option');
            option.value = month.value;
            option.textContent = month.label;
            monthSelect.appendChild(option);
        });
    }

    /**
     * Populate year filter dropdown
     * @private
     */
    populateYearFilter() {
        const yearSelect = document.getElementById('yearFilter');
        
        if (!yearSelect) {
            logger.error('Year filter element not found');
            return;
        }

        // Clear existing options
        yearSelect.innerHTML = '';

        // Add year options
        CONSTANTS.FILTERS.YEARS.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });
    }

    /**
     * Set default filter values
     * @private
     */
    setDefaultValues() {
        const monthSelect = document.getElementById('monthFilter');
        const yearSelect = document.getElementById('yearFilter');

        if (monthSelect) {
            monthSelect.value = CONSTANTS.FILTERS.DEFAULT_MONTH;
        }

        if (yearSelect) {
            yearSelect.value = CONSTANTS.FILTERS.DEFAULT_YEAR;
        }
    }

    /**
     * Get currently selected filters
     * @returns {Object} Current filter values
     */
    getSelectedFilters() {
        try {
            const monthSelect = document.getElementById('monthFilter');
            const yearSelect = document.getElementById('yearFilter');

            const filters = {
                month: monthSelect ? monthSelect.value : CONSTANTS.FILTERS.DEFAULT_MONTH,
                year: yearSelect ? yearSelect.value : CONSTANTS.FILTERS.DEFAULT_YEAR
            };

            logger.info('Current filters:', filters);
            return filters;

        } catch (error) {
            logger.error('Failed to get selected filters:', error);
            return {
                month: CONSTANTS.FILTERS.DEFAULT_MONTH,
                year: CONSTANTS.FILTERS.DEFAULT_YEAR
            };
        }
    }

    /**
     * Set filter values programmatically
     * @param {Object} filters - Filter values to set
     */
    setFilters(filters) {
        try {
            if (!filters || typeof filters !== 'object') {
                logger.warn('Invalid filters provided to setFilters');
                return;
            }

            const monthSelect = document.getElementById('monthFilter');
            const yearSelect = document.getElementById('yearFilter');

            if (filters.month && monthSelect) {
                monthSelect.value = filters.month;
            }

            if (filters.year && yearSelect) {
                yearSelect.value = filters.year;
            }

            this.currentFilters = { ...this.currentFilters, ...filters };
            logger.info('Filters updated:', this.currentFilters);

        } catch (error) {
            logger.error('Failed to set filters:', error);
        }
    }

    /**
     * Reset filters to default values
     */
    resetFilters() {
        try {
            logger.info('Resetting filters to defaults');
            
            this.setFilters({
                month: CONSTANTS.FILTERS.DEFAULT_MONTH,
                year: CONSTANTS.FILTERS.DEFAULT_YEAR
            });

        } catch (error) {
            logger.error('Failed to reset filters:', error);
        }
    }

    /**
     * Validate filter values
     * @param {Object} filters - Filter values to validate
     * @returns {boolean} True if valid
     */
    validateFilters(filters) {
        if (!filters || typeof filters !== 'object') {
            return false;
        }

        // Validate month
        if (filters.month) {
            const validMonths = CONSTANTS.FILTERS.MONTHS.map(m => m.value);
            if (!validMonths.includes(filters.month)) {
                logger.warn(`Invalid month filter: ${filters.month}`);
                return false;
            }
        }

        // Validate year
        if (filters.year) {
            if (!CONSTANTS.FILTERS.YEARS.includes(filters.year)) {
                logger.warn(`Invalid year filter: ${filters.year}`);
                return false;
            }
        }

        return true;
    }

    /**
     * Get date range for current filters
     * @param {Object} filters - Optional specific filters to use
     * @returns {Object} Date range with start and end dates
     */
    getDateRange(filters = null) {
        const activeFilters = filters || this.getSelectedFilters();
        
        try {
            if (activeFilters.month === 'last3') {
                return this.getLastThreeMonthsRange();
            }

            if (activeFilters.month && activeFilters.year) {
                return this.getMonthRange(activeFilters.month, activeFilters.year);
            }

            if (activeFilters.year) {
                return this.getYearRange(activeFilters.year);
            }

            // Default to last 3 months
            return this.getLastThreeMonthsRange();

        } catch (error) {
            logger.error('Failed to get date range:', error);
            return this.getLastThreeMonthsRange();
        }
    }

    /**
     * Get date range for last 3 months
     * @returns {Object} Date range object
     * @private
     */
    getLastThreeMonthsRange() {
        const now = new Date();
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        
        return {
            start: threeMonthsAgo,
            end: now,
            description: 'Last 3 Months'
        };
    }

    /**
     * Get date range for specific month and year
     * @param {string} month - Month (01-12)
     * @param {string} year - Year
     * @returns {Object} Date range object
     * @private
     */
    getMonthRange(month, year) {
        const monthNum = parseInt(month, 10) - 1; // JavaScript months are 0-based
        const yearNum = parseInt(year, 10);
        
        const start = new Date(yearNum, monthNum, 1);
        const end = new Date(yearNum, monthNum + 1, 0); // Last day of month
        
        const monthName = start.toLocaleDateString('en-US', { month: 'long' });
        
        return {
            start,
            end,
            description: `${monthName} ${year}`
        };
    }

    /**
     * Get date range for entire year
     * @param {string} year - Year
     * @returns {Object} Date range object
     * @private
     */
    getYearRange(year) {
        const yearNum = parseInt(year, 10);
        
        const start = new Date(yearNum, 0, 1); // January 1st
        const end = new Date(yearNum, 11, 31); // December 31st
        
        return {
            start,
            end,
            description: `Year ${year}`
        };
    }

    /**
     * Check if transaction falls within filter date range
     * @param {Object} transaction - Transaction object
     * @param {Object} dateRange - Date range to check against
     * @returns {boolean} True if transaction is within range
     */
    isTransactionInRange(transaction, dateRange) {
        if (!transaction || !transaction.date || !dateRange) {
            return false;
        }

        try {
            const transactionDate = new Date(transaction.date);
            
            if (isNaN(transactionDate.getTime())) {
                logger.warn('Invalid transaction date:', transaction.date);
                return false;
            }

            return transactionDate >= dateRange.start && transactionDate <= dateRange.end;

        } catch (error) {
            logger.error('Error checking transaction date range:', error);
            return false;
        }
    }

    /**
     * Get filter display text
     * @param {Object} filters - Optional specific filters
     * @returns {string} Human-readable filter description
     */
    getFilterDisplayText(filters = null) {
        const activeFilters = filters || this.getSelectedFilters();
        const dateRange = this.getDateRange(activeFilters);
        return dateRange.description;
    }

    /**
     * Get available years for filtering
     * @returns {Array} Array of available years
     */
    getAvailableYears() {
        return [...CONSTANTS.FILTERS.YEARS];
    }

    /**
     * Get available months for filtering
     * @returns {Array} Array of available months
     */
    getAvailableMonths() {
        return [...CONSTANTS.FILTERS.MONTHS];
    }
}
