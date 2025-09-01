/**
 * Customer Manager
 * Handles customer-related operations and data display
 * @module CustomerManager
 */

import logger from './logger.js';
import { RewardCalculator } from './rewardCalculator.js';
import { CONSTANTS, getMonthName, formatCurrency } from './constants.js';

/**
 * Manager class for customer operations
 * Coordinates between data service and UI for customer-related functionality
 */
export class CustomerManager {
    /**
     * Constructor
     * @param {DataService} dataService - Data service instance
     * @param {UIManager} uiManager - UI manager instance
     */
    constructor(dataService, uiManager) {
        this.dataService = dataService;
        this.uiManager = uiManager;
        this.currentCustomerId = null;
        this.currentFilters = null;
        this.currentTransactions = [];
    }

    /**
     * Populate customer dropdown with available customers
     * @returns {Promise<void>}
     */
    async populateCustomerDropdown() {
        try {
            logger.info('Populating customer dropdown');
            
            const customers = this.dataService.getCustomers();
            const customerSelect = document.getElementById('customerSelect');
            
            if (!customerSelect) {
                logger.error('Customer select element not found');
                return;
            }

            // Clear existing options except the first one
            while (customerSelect.children.length > 1) {
                customerSelect.removeChild(customerSelect.lastChild);
            }

            // Add customer options
            customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.customerId;
                option.textContent = `${customer.name} (ID: ${customer.customerId})`;
                customerSelect.appendChild(option);
            });

            logger.info(`Populated dropdown with ${customers.length} customers`);

        } catch (error) {
            logger.error('Failed to populate customer dropdown:', error);
            throw new Error('Failed to populate customer list');
        }
    }

    /**
     * Display customer data with rewards calculations
     * @param {string} customerId - Customer ID
     * @param {Object} filters - Optional filters for date range
     * @returns {Promise<void>}
     */
    async displayCustomerData(customerId, filters = null) {
        try {
            if (!customerId) {
                logger.warn('No customer ID provided');
                this.hideAllCustomerSections();
                return;
            }

            logger.info(`Displaying data for customer: ${customerId}`, filters);
            
            this.currentCustomerId = customerId;
            this.currentFilters = filters;

            // Get customer info
            logger.debug('Step 1: Getting customer info...');
            const customer = this.dataService.getCustomerById(customerId);
            if (!customer) {
                logger.error(`Customer not found: ${customerId}`);
                this.uiManager.showNoDataState();
                return;
            }
            logger.debug(`Found customer: ${customer.name}`);

            // Get transactions for customer with filters
            logger.debug('Step 2: Getting transactions...');
            const transactions = this.dataService.getTransactionsForCustomer(customerId, filters);
            this.currentTransactions = transactions;
            logger.debug(`Found ${transactions.length} transactions`);

            if (transactions.length === 0) {
                logger.info(`No transactions found for customer ${customerId} with current filters`);
                this.uiManager.showNoDataState();
                this.hideAllCustomerSections();
                return;
            }

            // Calculate rewards
            logger.debug('Step 3: Calculating rewards...');
            const totalPoints = RewardCalculator.calculateTotalPoints(transactions);
            logger.debug(`Total points calculated: ${totalPoints}`);
            
            const monthlyBreakdown = RewardCalculator.calculateMonthlyBreakdown(transactions);
            logger.debug('Monthly breakdown calculated');
            
            const transactionsWithPoints = RewardCalculator.calculatePointsWithDetails(transactions);
            logger.debug('Transaction details calculated');

            // Update UI
            logger.debug('Step 4: Updating UI...');
            this.displayCustomerSummary(customer, totalPoints, transactions.length, filters);
            logger.debug('Customer summary updated');
            
            this.displayMonthlyBreakdown(monthlyBreakdown);
            logger.debug('Monthly breakdown updated');
            
            this.displayTransactionDetails(transactionsWithPoints);
            logger.debug('Transaction details updated');

            // Hide no data state if it was showing
            this.uiManager.hideNoDataState();

            logger.info(`Successfully displayed data for customer ${customerId}`);

        } catch (error) {
            logger.error('Failed to display customer data:', error);
            logger.error('Error details:', error.message);
            logger.error('Stack trace:', error.stack);
            this.uiManager.showErrorState('Failed to load customer data. Please try again.');
        }
    }

    /**
     * Display customer summary section
     * @param {Object} customer - Customer object
     * @param {number} totalPoints - Total reward points
     * @param {number} transactionCount - Number of transactions
     * @param {Object} filters - Applied filters
     * @private
     */
    displayCustomerSummary(customer, totalPoints, transactionCount, filters) {
        try {
            // Update summary values
            const totalPointsElement = document.getElementById('totalPoints');
            const selectedPeriodElement = document.getElementById('selectedPeriod');
            const totalTransactionsElement = document.getElementById('totalTransactions');

            if (totalPointsElement) {
                totalPointsElement.textContent = totalPoints.toLocaleString();
            }

            if (selectedPeriodElement) {
                const periodText = this.getFilterDisplayText(filters);
                selectedPeriodElement.textContent = periodText;
            }

            if (totalTransactionsElement) {
                totalTransactionsElement.textContent = transactionCount;
            }

            // Show customer summary section
            this.uiManager.showCustomerSummary();

            logger.info(`Updated customer summary for ${customer.name}`);

        } catch (error) {
            logger.error('Failed to display customer summary:', error);
        }
    }

    /**
     * Display monthly breakdown section
     * @param {Object} monthlyBreakdown - Monthly points breakdown
     * @private
     */
    displayMonthlyBreakdown(monthlyBreakdown) {
        try {
            const monthlyDataElement = document.getElementById('monthlyData');
            
            if (!monthlyDataElement) {
                logger.error('Monthly data element not found');
                return;
            }

            // Clear existing content
            monthlyDataElement.innerHTML = '';

            // Sort months chronologically
            const sortedMonths = Object.keys(monthlyBreakdown).sort();

            if (sortedMonths.length === 0) {
                monthlyDataElement.innerHTML = '<p class="no-data">No monthly data available</p>';
                return;
            }

            // Create monthly breakdown cards
            sortedMonths.forEach(monthYear => {
                const data = monthlyBreakdown[monthYear];
                const monthCard = this.createMonthlyCard(monthYear, data);
                monthlyDataElement.appendChild(monthCard);
            });

            // Show monthly breakdown section
            this.uiManager.showMonthlyBreakdown();

            logger.info(`Displayed monthly breakdown for ${sortedMonths.length} months`);

        } catch (error) {
            logger.error('Failed to display monthly breakdown:', error);
        }
    }

    /**
     * Create monthly breakdown card
     * @param {string} monthYear - Month-year key
     * @param {Object} data - Monthly data
     * @returns {HTMLElement} Monthly card element
     * @private
     */
    createMonthlyCard(monthYear, data) {
        const card = document.createElement('div');
        card.className = 'monthly-card';
        card.setAttribute('data-month', monthYear);

        const displayMonth = RewardCalculator.getMonthYearDisplay(monthYear);
        
        card.innerHTML = `
            <div class="monthly-card-header">
                <h3>${displayMonth}</h3>
                <div class="monthly-points">${data.points} points</div>
            </div>
            <div class="monthly-card-body">
                <div class="monthly-stat">
                    <span class="stat-label">Transactions:</span>
                    <span class="stat-value">${data.transactionCount}</span>
                </div>
                <div class="monthly-stat">
                    <span class="stat-label">Total Spent:</span>
                    <span class="stat-value">${formatCurrency(data.totalAmount)}</span>
                </div>
            </div>
        `;

        // Add click listener to show transactions for this month
        card.addEventListener('click', () => {
            this.showTransactionsForMonth(monthYear);
        });

        return card;
    }

    /**
     * Display transaction details section
     * @param {Array} transactions - Transactions with calculated points
     * @private
     */
    displayTransactionDetails(transactions) {
        try {
            const transactionsListElement = document.getElementById('transactionsList');
            
            if (!transactionsListElement) {
                logger.error('Transactions list element not found');
                return;
            }

            // Clear existing content
            transactionsListElement.innerHTML = '';

            if (transactions.length === 0) {
                transactionsListElement.innerHTML = '<p class="no-data">No transactions to display</p>';
                return;
            }

            // Create transaction table
            const table = this.createTransactionTable(transactions);
            transactionsListElement.appendChild(table);

            // Set up pagination if needed
            this.setupTransactionPagination(transactions);

            // Show transaction details section
            this.uiManager.showTransactionDetails();

            logger.info(`Displayed ${transactions.length} transaction details`);

        } catch (error) {
            logger.error('Failed to display transaction details:', error);
        }
    }

    /**
     * Create transaction table
     * @param {Array} transactions - Transactions to display
     * @returns {HTMLElement} Table element
     * @private
     */
    createTransactionTable(transactions) {
        const table = document.createElement('table');
        table.className = 'transactions-table';

        // Create header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Transaction ID</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Points Earned</th>
                <th>Points Breakdown</th>
            </tr>
        `;
        table.appendChild(thead);

        // Create body
        const tbody = document.createElement('tbody');
        
        const itemsPerPage = CONSTANTS.PAGINATION.TRANSACTIONS_PER_PAGE;
        const currentPage = 1; // Start with first page
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, transactions.length);
        const pageTransactions = transactions.slice(startIndex, endIndex);

        pageTransactions.forEach(transaction => {
            const row = this.createTransactionRow(transaction);
            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        return table;
    }

    /**
     * Create transaction table row
     * @param {Object} transaction - Transaction object with points
     * @returns {HTMLElement} Table row element
     * @private
     */
    createTransactionRow(transaction) {
        const row = document.createElement('tr');
        
        const formattedDate = new Date(transaction.date).toLocaleDateString();
        const breakdown = transaction.pointsBreakdown || { highTier: 0, lowTier: 0 };
        const breakdownText = this.formatPointsBreakdown(breakdown);

        row.innerHTML = `
            <td>${transaction.transactionId}</td>
            <td>${formattedDate}</td>
            <td>${formatCurrency(transaction.amount)}</td>
            <td class="points-cell">${transaction.points}</td>
            <td class="breakdown-cell">${breakdownText}</td>
        `;

        return row;
    }

    /**
     * Format points breakdown for display
     * @param {Object} breakdown - Points breakdown object
     * @returns {string} Formatted breakdown text
     * @private
     */
    formatPointsBreakdown(breakdown) {
        const parts = [];
        
        if (breakdown.lowTier > 0) {
            parts.push(`${breakdown.lowTier} (from $50-$100)`);
        }
        
        if (breakdown.highTier > 0) {
            parts.push(`${breakdown.highTier} (from >$100)`);
        }
        
        return parts.length > 0 ? parts.join(' + ') : '0 points';
    }

    /**
     * Setup pagination for transactions
     * @param {Array} transactions - All transactions
     * @private
     */
    setupTransactionPagination(transactions) {
        const totalPages = Math.ceil(transactions.length / CONSTANTS.PAGINATION.TRANSACTIONS_PER_PAGE);
        
        if (totalPages <= 1) {
            this.uiManager.hidePaginationControls();
            return;
        }

        this.uiManager.showPaginationControls();
        this.uiManager.updatePaginationInfo(1, totalPages);
        
        // Store pagination data for later use
        this.paginationData = {
            transactions,
            currentPage: 1,
            totalPages
        };
    }

    /**
     * Show transactions for a specific month
     * @param {string} monthYear - Month-year key
     */
    showTransactionsForMonth(monthYear) {
        try {
            logger.info(`Showing transactions for ${monthYear}`);
            
            // Filter transactions for the selected month
            const monthTransactions = this.currentTransactions.filter(transaction => {
                const transactionDate = new Date(transaction.date);
                const transactionMonthYear = RewardCalculator.getMonthYearKey(transactionDate);
                return transactionMonthYear === monthYear;
            });

            if (monthTransactions.length === 0) {
                logger.info(`No transactions found for ${monthYear}`);
                return;
            }

            // Update transaction details with filtered data
            const transactionsWithPoints = RewardCalculator.calculatePointsWithDetails(monthTransactions);
            this.displayTransactionDetails(transactionsWithPoints);

            // Scroll to transaction details
            const detailsSection = document.getElementById('transactionDetails');
            if (detailsSection) {
                detailsSection.scrollIntoView({ behavior: 'smooth' });
            }

        } catch (error) {
            logger.error('Failed to show transactions for month:', error);
        }
    }

    /**
     * Get display text for current filters
     * @param {Object} filters - Filter object
     * @returns {string} Display text
     * @private
     */
    getFilterDisplayText(filters) {
        if (!filters || filters.month === 'last3') {
            return 'Last 3 Months';
        }

        if (filters.month && filters.year) {
            const monthName = getMonthName(filters.month);
            return `${monthName} ${filters.year}`;
        }

        if (filters.year) {
            return `Year ${filters.year}`;
        }

        return 'Custom Period';
    }

    /**
     * Hide all customer-related sections
     * @private
     */
    hideAllCustomerSections() {
        this.uiManager.hideCustomerSummary();
        this.uiManager.hideMonthlyBreakdown();
        this.uiManager.hideTransactionDetails();
        this.uiManager.hidePaginationControls();
    }

    /**
     * Get current customer ID
     * @returns {string|null} Current customer ID
     */
    getCurrentCustomerId() {
        return this.currentCustomerId;
    }

    /**
     * Get current transactions
     * @returns {Array} Current transactions array
     */
    getCurrentTransactions() {
        return [...this.currentTransactions];
    }
}
