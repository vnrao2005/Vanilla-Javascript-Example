/**
 * Data Service
 * Handles all data operations including fetching and caching
 * @module DataService
 */

import logger from './logger.js';
import { CONSTANTS } from './constants.js';

/**
 * Service class for managing customer and transaction data
 * Simulates API calls with loading states and error handling
 */
export class DataService {
    constructor() {
        this.customers = [];
        this.transactions = [];
        this.isLoading = false;
        this.cache = new Map();
    }

    /**
     * Load customers data from JSON file
     * Simulates async API call with loading state
     * @returns {Promise<Array>} Array of customer objects
     * @throws {Error} When data loading fails
     */
    async loadCustomers() {
        if (this.customers.length > 0) {
            logger.info('Customers already loaded from cache');
            return this.customers;
        }

        const cacheKey = 'customers';
        if (this.cache.has(cacheKey)) {
            this.customers = this.cache.get(cacheKey);
            return this.customers;
        }

        this.isLoading = true;
        logger.info('Loading customers data...');

        try {
            // Simulate API delay
            await this.simulateDelay();
            
            // Check for simulated errors
            this.checkForSimulatedError();

            const response = await fetch(CONSTANTS.DATA_PATHS.CUSTOMERS);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!Array.isArray(data)) {
                throw new Error('Invalid customers data format');
            }

            this.customers = this.validateCustomersData(data);
            this.cache.set(cacheKey, this.customers);
            
            logger.info(`Successfully loaded ${this.customers.length} customers`);
            return this.customers;

        } catch (error) {
            logger.error('Failed to load customers:', error);
            throw new Error(`Failed to load customers data: ${error.message}`);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Load transactions data from JSON file
     * Simulates async API call with loading state
     * @returns {Promise<Array>} Array of transaction objects
     * @throws {Error} When data loading fails
     */
    async loadTransactions() {
        if (this.transactions.length > 0) {
            logger.info('Transactions already loaded from cache');
            return this.transactions;
        }

        const cacheKey = 'transactions';
        if (this.cache.has(cacheKey)) {
            this.transactions = this.cache.get(cacheKey);
            return this.transactions;
        }

        this.isLoading = true;
        logger.info('Loading transactions data...');

        try {
            // Simulate API delay
            await this.simulateDelay();
            
            // Check for simulated errors
            this.checkForSimulatedError();

            const response = await fetch(CONSTANTS.DATA_PATHS.TRANSACTIONS);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!Array.isArray(data)) {
                throw new Error('Invalid transactions data format');
            }

            this.transactions = this.validateTransactionsData(data);
            this.cache.set(cacheKey, this.transactions);
            
            logger.info(`Successfully loaded ${this.transactions.length} transactions`);
            return this.transactions;

        } catch (error) {
            logger.error('Failed to load transactions:', error);
            throw new Error(`Failed to load transactions data: ${error.message}`);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Get all customers
     * @returns {Array} Array of customer objects
     */
    getCustomers() {
        return [...this.customers];
    }

    /**
     * Get customer by ID
     * @param {string} customerId - Customer ID
     * @returns {Object|null} Customer object or null if not found
     */
    getCustomerById(customerId) {
        if (!customerId) {
            logger.warn('getCustomerById called with empty customerId');
            return null;
        }
        
        return this.customers.find(customer => customer.customerId === customerId) || null;
    }

    /**
     * Get transactions for a specific customer
     * @param {string} customerId - Customer ID
     * @param {Object} filters - Optional filters (month, year)
     * @returns {Array} Array of filtered transaction objects
     */
    getTransactionsForCustomer(customerId, filters = {}) {
        if (!customerId) {
            logger.warn('getTransactionsForCustomer called with empty customerId');
            return [];
        }

        let customerTransactions = this.transactions.filter(
            transaction => transaction.customerId === customerId
        );

        // Debug: Check filters parameter
        console.log('DEBUG: filters parameter:', filters);
        
        if (filters && (filters.month || filters.year)) {
            console.log('DEBUG: Applying filters');
            customerTransactions = this.applyDateFilters(customerTransactions, filters);
        } else {
            console.log('DEBUG: No filters to apply, filters is:', filters);
        }

        // Sort by date descending (newest first)
        customerTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        logger.info(`Found ${customerTransactions.length} transactions for customer ${customerId}`);
        return customerTransactions;
    }

    /**
     * Apply date filters to transactions
     * @param {Array} transactions - Array of transactions
     * @param {Object} filters - Filter object with month and year
     * @returns {Array} Filtered transactions
     * @private
     */
    applyDateFilters(transactions, filters) {
        if (!filters) {
            return transactions;
        }
        const { month, year } = filters;
        
        if (month === 'last3' || !month) {
            return this.getLastThreeMonthsTransactions(transactions);
        }

        return transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            const transactionMonth = String(transactionDate.getMonth() + 1).padStart(2, '0');
            const transactionYear = String(transactionDate.getFullYear());

            const monthMatches = !month || transactionMonth === month;
            const yearMatches = !year || transactionYear === year;

            return monthMatches && yearMatches;
        });
    }

    /**
     * Get transactions from the last 3 months
     * @param {Array} transactions - Array of transactions
     * @returns {Array} Filtered transactions
     * @private
     */
    getLastThreeMonthsTransactions(transactions) {
        const now = new Date();
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        
        return transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate >= threeMonthsAgo && transactionDate <= now;
        });
    }

    /**
     * Validate customers data structure
     * @param {Array} data - Raw customers data
     * @returns {Array} Validated customers data
     * @throws {Error} If data validation fails
     * @private
     */
    validateCustomersData(data) {
        const validatedData = [];
        
        for (const customer of data) {
            if (!customer.customerId || !customer.name) {
                logger.warn('Invalid customer data found, skipping:', customer);
                continue;
            }
            
            validatedData.push({
                customerId: String(customer.customerId),
                name: String(customer.name),
                email: customer.email ? String(customer.email) : '',
                joinDate: customer.joinDate ? String(customer.joinDate) : ''
            });
        }
        
        if (validatedData.length === 0) {
            throw new Error('No valid customer data found');
        }
        
        return validatedData;
    }

    /**
     * Validate transactions data structure
     * @param {Array} data - Raw transactions data
     * @returns {Array} Validated transactions data
     * @throws {Error} If data validation fails
     * @private
     */
    validateTransactionsData(data) {
        const validatedData = [];
        
        for (const transaction of data) {
            if (!transaction.transactionId || !transaction.customerId || 
                typeof transaction.amount !== 'number' || !transaction.date) {
                logger.warn('Invalid transaction data found, skipping:', transaction);
                continue;
            }
            
            // Validate date format
            const transactionDate = new Date(transaction.date);
            if (isNaN(transactionDate.getTime())) {
                logger.warn('Invalid date format in transaction, skipping:', transaction);
                continue;
            }
            
            validatedData.push({
                transactionId: String(transaction.transactionId),
                customerId: String(transaction.customerId),
                amount: Number(transaction.amount),
                date: String(transaction.date)
            });
        }
        
        if (validatedData.length === 0) {
            throw new Error('No valid transaction data found');
        }
        
        return validatedData;
    }

    /**
     * Simulate API delay for realistic UX
     * @returns {Promise} Resolves after delay
     * @private
     */
    async simulateDelay() {
        if (CONSTANTS.API.SIMULATE_DELAY > 0) {
            await new Promise(resolve => setTimeout(resolve, CONSTANTS.API.SIMULATE_DELAY));
        }
    }

    /**
     * Check for simulated errors (for testing error handling)
     * @throws {Error} If simulated error should occur
     * @private
     */
    checkForSimulatedError() {
        if (CONSTANTS.API.ERROR_RATE > 0 && Math.random() < CONSTANTS.API.ERROR_RATE) {
            throw new Error('Simulated network error');
        }
    }

    /**
     * Clear cache (useful for testing or data refresh)
     */
    clearCache() {
        this.cache.clear();
        this.customers = [];
        this.transactions = [];
        logger.info('Data cache cleared');
    }

    /**
     * Check if service is currently loading data
     * @returns {boolean} True if loading
     */
    isDataLoading() {
        return this.isLoading;
    }
}
