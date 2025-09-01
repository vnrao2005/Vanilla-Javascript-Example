/**
 * Application constants
 * Centralized configuration and static values
 * @module Constants
 */

export const CONSTANTS = {
    // Reward calculation thresholds
    REWARDS: {
        HIGH_THRESHOLD: 100,
        LOW_THRESHOLD: 50,
        HIGH_MULTIPLIER: 2,
        LOW_MULTIPLIER: 1
    },

    // Pagination settings
    PAGINATION: {
        TRANSACTIONS_PER_PAGE: 10,
        DEFAULT_PAGE: 1
    },

    // Date formats and periods
    DATE_FORMATS: {
        DISPLAY_FORMAT: 'MM/DD/YYYY',
        API_FORMAT: 'YYYY-MM-DD',
        MONTH_YEAR: 'YYYY-MM'
    },

    // Filter options
    FILTERS: {
        DEFAULT_MONTH: 'last3',
        DEFAULT_YEAR: '2025',
        MONTHS: [
            { value: 'last3', label: 'Last 3 Months (Default)' },
            { value: '01', label: 'January' },
            { value: '02', label: 'February' },
            { value: '03', label: 'March' },
            { value: '04', label: 'April' },
            { value: '05', label: 'May' },
            { value: '06', label: 'June' },
            { value: '07', label: 'July' },
            { value: '08', label: 'August' },
            { value: '09', label: 'September' },
            { value: '10', label: 'October' },
            { value: '11', label: 'November' },
            { value: '12', label: 'December' }
        ],
        YEARS: ['2025', '2024', '2023', '2022', '2021']
    },

    // API simulation settings
    API: {
        SIMULATE_DELAY: 0, // milliseconds - disabled for debugging
        ERROR_RATE: 0, // 0 = no errors, 1 = always error
        RETRY_ATTEMPTS: 3
    },

    // UI messages
    MESSAGES: {
        NO_TRANSACTIONS: 'No transactions found for the selected period.',
        LOADING: 'Loading data...',
        ERROR_LOADING: 'Error loading data. Please try again.',
        SELECT_CUSTOMER: '-- Select Customer --'
    },

    // Data file paths
    DATA_PATHS: {
        CUSTOMERS: 'public/data/customers.json',
        TRANSACTIONS: 'public/data/transactions.json'
    },

    // CSS classes for dynamic styling
    CSS_CLASSES: {
        HIDDEN: 'hidden',
        LOADING: 'loading',
        ERROR: 'error',
        SUCCESS: 'success',
        ACTIVE: 'active',
        DISABLED: 'disabled'
    }
};

/**
 * Utility function to get month name from number
 * @param {string|number} monthNumber - Month number (01-12)
 * @returns {string} Month name
 */
export const getMonthName = (monthNumber) => {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const index = parseInt(monthNumber, 10) - 1;
    return monthNames[index] || 'Unknown';
};

/**
 * Utility function to format currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return '$0.00';
    }
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount);
};

/**
 * Utility function to format date
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
    }
    
    return dateObj.toLocaleDateString('en-US');
};
