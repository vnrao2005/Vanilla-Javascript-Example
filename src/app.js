/**
 * Main application entry point
 * Initializes the rewards program calculator application
 * @module App
 */

import logger from './logger.js';
import { DataService } from './dataService.js';
import { CustomerManager } from './customerManager.js';
import { FilterManager } from './filterManager.js';
import { PaginationManager } from './paginationManager.js';
import { UIManager } from './uiManager.js';
import { CONSTANTS } from './constants.js';

/**
 * Main Application class
 * Coordinates all application modules and handles initialization
 */
class App {
    constructor() {
        this.dataService = new DataService();
        this.customerManager = null;
        this.filterManager = null;
        this.paginationManager = null;
        this.uiManager = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the application
     * Sets up all managers and loads initial data
     */
    async init() {
        try {
            logger.info('Initializing Rewards Program Calculator');
            
            // Show loading state
            this.showLoadingState();
            
            // Load data
            await this.loadData();
            
            // Initialize managers
            this.initializeManagers();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Hide loading and show main content
            this.showMainContent();
            
            this.isInitialized = true;
            logger.info('Application initialized successfully');
            
        } catch (error) {
            logger.error('Failed to initialize application:', error);
            this.showErrorState(error.message);
        }
    }

    /**
     * Load initial data from data service
     * @private
     */
    async loadData() {
        try {
            console.log('Starting to load data...');
            console.log('Loading customers...');
            await this.dataService.loadCustomers();
            console.log('Customers loaded, now loading transactions...');
            await this.dataService.loadTransactions();
            console.log('All data loaded successfully');
            logger.info('Data loaded successfully');
        } catch (error) {
            console.error('Error loading data:', error);
            logger.error('Failed to load data:', error);
            throw new Error('Unable to load customer and transaction data. Please check your connection and try again.');
        }
    }

    /**
     * Initialize all manager instances
     * @private
     */
    initializeManagers() {
        this.uiManager = new UIManager();
        this.customerManager = new CustomerManager(this.dataService, this.uiManager);
        this.filterManager = new FilterManager(this.uiManager);
        this.paginationManager = new PaginationManager(this.uiManager);
        
        // Populate customer dropdown
        this.customerManager.populateCustomerDropdown();
    }

    /**
     * Set up all event listeners
     * @private
     */
    setupEventListeners() {
        // Retry button
        const retryBtn = document.getElementById('retryBtn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.handleRetry());
        }

        // Customer selection
        const customerSelect = document.getElementById('customerSelect');
        if (customerSelect) {
            customerSelect.addEventListener('change', (e) => this.handleCustomerChange(e));
        }

        // Apply filters button
        const applyFiltersBtn = document.getElementById('applyFilters');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => this.handleApplyFilters());
        }

        // Pagination controls
        const prevPageBtn = document.getElementById('prevPage');
        const nextPageBtn = document.getElementById('nextPage');
        
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => this.handlePreviousPage());
        }
        
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => this.handleNextPage());
        }
    }

    /**
     * Handle retry button click
     * @private
     */
    async handleRetry() {
        logger.info('Retrying application initialization');
        await this.init();
    }

    /**
     * Handle customer selection change
     * @param {Event} event - Change event from customer dropdown
     * @private
     */
    async handleCustomerChange(event) {
        const customerId = event.target.value;
        
        if (!customerId) {
            this.uiManager.hideCustomerSummary();
            this.uiManager.hideMonthlyBreakdown();
            this.uiManager.hideTransactionDetails();
            this.uiManager.hideNoDataState();
            return;
        }

        try {
            logger.info(`Customer selected: ${customerId}`);
            await this.customerManager.displayCustomerData(customerId);
        } catch (error) {
            logger.error('Failed to load customer data:', error);
            this.uiManager.showErrorState('Failed to load customer data. Please try again.');
        }
    }

    /**
     * Handle apply filters button click
     * @private
     */
    async handleApplyFilters() {
        const customerId = document.getElementById('customerSelect').value;
        
        if (!customerId) {
            logger.warn('No customer selected for filtering');
            return;
        }

        try {
            const filters = this.filterManager.getSelectedFilters();
            logger.info('Applying filters:', filters);
            await this.customerManager.displayCustomerData(customerId, filters);
        } catch (error) {
            logger.error('Failed to apply filters:', error);
            this.uiManager.showErrorState('Failed to apply filters. Please try again.');
        }
    }

    /**
     * Handle previous page button click
     * @private
     */
    handlePreviousPage() {
        this.paginationManager.goToPreviousPage();
    }

    /**
     * Handle next page button click
     * @private
     */
    handleNextPage() {
        this.paginationManager.goToNextPage();
    }

    /**
     * Show loading state
     * @private
     */
    showLoadingState() {
        console.log('Showing loading state');
        if (this.uiManager) {
            this.uiManager.showElement('loadingState');
            this.uiManager.hideElement('mainContent');
            this.uiManager.hideElement('errorState');
        } else {
            // Fallback if uiManager not ready
            const loading = document.getElementById('loadingState');
            const main = document.getElementById('mainContent');
            const error = document.getElementById('errorState');
            
            if (loading) loading.classList.remove('hidden');
            if (main) main.classList.add('hidden');
            if (error) error.classList.add('hidden');
        }
    }

    /**
     * Show main content
     * @private
     */
    showMainContent() {
        console.log('Showing main content');
        if (this.uiManager) {
            this.uiManager.hideElement('loadingState');
            this.uiManager.hideElement('errorState');
            this.uiManager.showElement('mainContent');
        } else {
            // Fallback if uiManager not ready
            const loading = document.getElementById('loadingState');
            const main = document.getElementById('mainContent');
            const error = document.getElementById('errorState');
            
            if (loading) loading.classList.add('hidden');
            if (main) main.classList.remove('hidden');
            if (error) error.classList.add('hidden');
        }
    }

    /**
     * Show error state with message
     * @param {string} message - Error message to display
     * @private
     */
    showErrorState(message) {
        this.uiManager.hideElement('loadingState');
        this.uiManager.hideElement('mainContent');
        this.uiManager.showElement('errorState');
        
        const errorMessageElement = document.getElementById('errorMessage');
        if (errorMessageElement) {
            errorMessageElement.textContent = message;
        }
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Initializing Rewards Program Calculator...');
        
        // Show main content immediately
        const loadingState = document.getElementById('loadingState');
        const mainContent = document.getElementById('mainContent');
        const errorState = document.getElementById('errorState');
        
        if (loadingState) loadingState.classList.add('hidden');
        if (errorState) errorState.classList.add('hidden');
        if (mainContent) {
            mainContent.classList.remove('hidden');
            console.log('Main content is now visible');
        }
        
        // Initialize app in background
        const app = new App();
        await app.init();
    } catch (error) {
        console.error('Failed to initialize application:', error);
        
        // Show error state directly if app fails to initialize
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');
        const errorMessage = document.getElementById('errorMessage');
        
        if (loadingState) loadingState.classList.add('hidden');
        if (errorState) {
            errorState.classList.remove('hidden');
            if (errorMessage) {
                errorMessage.textContent = 'Failed to initialize application. Please refresh the page or contact support.';
            }
        }
    }
});

export default App;
