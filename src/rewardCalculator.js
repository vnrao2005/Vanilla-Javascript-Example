/**
 * Reward Calculator
 * Handles all reward point calculations based on business rules
 * @module RewardCalculator
 */

import logger from './logger.js';
import { CONSTANTS } from './constants.js';

/**
 * Calculator class for computing reward points
 * Implements the business logic for point calculation
 */
export class RewardCalculator {
    /**
     * Calculate reward points for a single transaction
     * Business rule: 2 points per dollar over $100, 1 point per dollar between $50-$100
     * @param {number} amount - Transaction amount
     * @returns {number} Calculated reward points
     * @throws {Error} If amount is invalid
     */
    static calculatePointsForTransaction(amount) {
        if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
            logger.error(`Invalid transaction amount: ${amount}`);
            throw new Error(`Invalid transaction amount: ${amount}`);
        }

        let points = 0;
        const { HIGH_THRESHOLD, LOW_THRESHOLD, HIGH_MULTIPLIER, LOW_MULTIPLIER } = CONSTANTS.REWARDS;

        // Calculate points for amount over $100 (2 points per dollar)
        if (amount > HIGH_THRESHOLD) {
            const amountOverHundred = amount - HIGH_THRESHOLD;
            points += Math.floor(amountOverHundred * HIGH_MULTIPLIER);
            logger.debug(`Points from amount over $${HIGH_THRESHOLD}: ${Math.floor(amountOverHundred * HIGH_MULTIPLIER)}`);
        }

        // Calculate points for amount between $50 and $100 (1 point per dollar)
        const amountForLowTier = Math.min(amount, HIGH_THRESHOLD) - LOW_THRESHOLD;
        if (amountForLowTier > 0) {
            points += Math.floor(amountForLowTier * LOW_MULTIPLIER);
            logger.debug(`Points from amount between $${LOW_THRESHOLD}-$${HIGH_THRESHOLD}: ${Math.floor(amountForLowTier * LOW_MULTIPLIER)}`);
        }

        logger.debug(`Transaction amount: $${amount.toFixed(2)}, Total points: ${points}`);
        return points;
    }

    /**
     * Calculate total reward points for multiple transactions
     * @param {Array} transactions - Array of transaction objects
     * @returns {number} Total reward points
     * @throws {Error} If transactions array is invalid
     */
    static calculateTotalPoints(transactions) {
        if (!Array.isArray(transactions)) {
            logger.error('Invalid transactions array provided');
            throw new Error('Transactions must be an array');
        }

        if (transactions.length === 0) {
            logger.info('No transactions provided, returning 0 points');
            return 0;
        }

        let totalPoints = 0;
        let validTransactions = 0;

        for (const transaction of transactions) {
            try {
                if (!transaction || typeof transaction.amount !== 'number') {
                    logger.warn('Skipping invalid transaction:', transaction);
                    continue;
                }

                const points = this.calculatePointsForTransaction(transaction.amount);
                totalPoints += points;
                validTransactions++;

            } catch (error) {
                logger.warn(`Skipping transaction due to error: ${error.message}`, transaction);
                continue;
            }
        }

        logger.info(`Calculated total points: ${totalPoints} from ${validTransactions} valid transactions`);
        return totalPoints;
    }

    /**
     * Calculate monthly reward points breakdown
     * @param {Array} transactions - Array of transaction objects
     * @returns {Object} Monthly breakdown with month-year as keys and points as values
     * @throws {Error} If transactions array is invalid
     */
    static calculateMonthlyBreakdown(transactions) {
        if (!Array.isArray(transactions)) {
            logger.error('Invalid transactions array provided for monthly breakdown');
            throw new Error('Transactions must be an array');
        }

        const monthlyBreakdown = {};

        for (const transaction of transactions) {
            try {
                if (!transaction || typeof transaction.amount !== 'number' || !transaction.date) {
                    logger.warn('Skipping invalid transaction in monthly breakdown:', transaction);
                    continue;
                }

                const transactionDate = new Date(transaction.date);
                if (isNaN(transactionDate.getTime())) {
                    logger.warn('Skipping transaction with invalid date:', transaction);
                    continue;
                }

                const monthYear = this.getMonthYearKey(transactionDate);
                const points = this.calculatePointsForTransaction(transaction.amount);

                if (!monthlyBreakdown[monthYear]) {
                    monthlyBreakdown[monthYear] = {
                        points: 0,
                        transactionCount: 0,
                        totalAmount: 0
                    };
                }

                monthlyBreakdown[monthYear].points += points;
                monthlyBreakdown[monthYear].transactionCount++;
                monthlyBreakdown[monthYear].totalAmount += transaction.amount;

            } catch (error) {
                logger.warn(`Error processing transaction for monthly breakdown: ${error.message}`, transaction);
                continue;
            }
        }

        logger.info(`Generated monthly breakdown for ${Object.keys(monthlyBreakdown).length} months`);
        return monthlyBreakdown;
    }

    /**
     * Calculate reward points with transaction details
     * @param {Array} transactions - Array of transaction objects
     * @returns {Array} Transactions with calculated points added
     */
    static calculatePointsWithDetails(transactions) {
        if (!Array.isArray(transactions)) {
            logger.error('Invalid transactions array provided for points details');
            throw new Error('Transactions must be an array');
        }

        const transactionsWithPoints = [];

        for (const transaction of transactions) {
            try {
                if (!transaction || typeof transaction.amount !== 'number') {
                    logger.warn('Skipping invalid transaction in points details:', transaction);
                    continue;
                }

                const points = this.calculatePointsForTransaction(transaction.amount);
                
                transactionsWithPoints.push({
                    ...transaction,
                    points: points,
                    pointsBreakdown: this.getPointsBreakdown(transaction.amount)
                });

            } catch (error) {
                logger.warn(`Error calculating points for transaction: ${error.message}`, transaction);
                // Still add the transaction but with 0 points
                transactionsWithPoints.push({
                    ...transaction,
                    points: 0,
                    pointsBreakdown: { highTier: 0, lowTier: 0 }
                });
            }
        }

        logger.info(`Calculated points details for ${transactionsWithPoints.length} transactions`);
        return transactionsWithPoints;
    }

    /**
     * Get detailed breakdown of how points were calculated
     * @param {number} amount - Transaction amount
     * @returns {Object} Breakdown of points calculation
     * @private
     */
    static getPointsBreakdown(amount) {
        if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
            return { highTier: 0, lowTier: 0 };
        }

        const { HIGH_THRESHOLD, LOW_THRESHOLD, HIGH_MULTIPLIER, LOW_MULTIPLIER } = CONSTANTS.REWARDS;
        let highTierPoints = 0;
        let lowTierPoints = 0;

        // Calculate high tier points (over $100)
        if (amount > HIGH_THRESHOLD) {
            const amountOverHundred = amount - HIGH_THRESHOLD;
            highTierPoints = Math.floor(amountOverHundred * HIGH_MULTIPLIER);
        }

        // Calculate low tier points ($50-$100)
        const amountForLowTier = Math.min(amount, HIGH_THRESHOLD) - LOW_THRESHOLD;
        if (amountForLowTier > 0) {
            lowTierPoints = Math.floor(amountForLowTier * LOW_MULTIPLIER);
        }

        return {
            highTier: highTierPoints,
            lowTier: lowTierPoints
        };
    }

    /**
     * Generate month-year key for grouping
     * @param {Date} date - Date object
     * @returns {string} Month-year key (e.g., "2025-01")
     * @private
     */
    static getMonthYearKey(date) {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            throw new Error('Invalid date provided');
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }

    /**
     * Get month name from month-year key
     * @param {string} monthYearKey - Month-year key (e.g., "2025-01")
     * @returns {string} Formatted month name and year
     */
    static getMonthYearDisplay(monthYearKey) {
        if (typeof monthYearKey !== 'string' || !monthYearKey.includes('-')) {
            return 'Invalid Date';
        }

        const [year, month] = monthYearKey.split('-');
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const monthIndex = parseInt(month, 10) - 1;
        const monthName = monthNames[monthIndex] || 'Unknown';
        
        return `${monthName} ${year}`;
    }

    /**
     * Validate reward calculation parameters
     * @param {*} amount - Amount to validate
     * @returns {boolean} True if valid
     */
    static isValidAmount(amount) {
        return typeof amount === 'number' && !isNaN(amount) && amount >= 0;
    }
}
