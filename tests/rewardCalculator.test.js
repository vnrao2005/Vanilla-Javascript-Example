/**
 * Unit tests for RewardCalculator
 * Tests positive and negative scenarios including edge cases
 * @module RewardCalculatorTests
 */

import { RewardCalculator } from '../src/rewardCalculator.js';

// Mock logger to avoid console output during tests
jest.mock('../src/logger.js', () => ({
    default: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
    }
}));

describe('RewardCalculator', () => {
    describe('calculatePointsForTransaction - Positive Test Cases', () => {
        test('should calculate points correctly for amount over $100', () => {
            // Test case: $120 purchase = 2x$20 + 1x$50 = 90 points
            const result = RewardCalculator.calculatePointsForTransaction(120);
            expect(result).toBe(90);
        });

        test('should calculate points correctly for amount between $50-$100', () => {
            // Test case: $75 purchase = 1x$25 = 25 points
            const result = RewardCalculator.calculatePointsForTransaction(75);
            expect(result).toBe(25);
        });

        test('should calculate points correctly for amount under $50', () => {
            // Test case: $30 purchase = 0 points
            const result = RewardCalculator.calculatePointsForTransaction(30);
            expect(result).toBe(0);
        });

        test('should handle fractional values correctly', () => {
            // Test case: $125.75 purchase = 2x$25.75 + 1x$50 = 51 + 50 = 101 points (floor applied)
            const result = RewardCalculator.calculatePointsForTransaction(125.75);
            expect(result).toBe(101);
        });

        test('should handle exact threshold values', () => {
            // Test case: Exactly $100 = 1x$50 = 50 points
            const result1 = RewardCalculator.calculatePointsForTransaction(100);
            expect(result1).toBe(50);

            // Test case: Exactly $50 = 0 points
            const result2 = RewardCalculator.calculatePointsForTransaction(50);
            expect(result2).toBe(0);
        });

        test('should handle large amounts correctly', () => {
            // Test case: $1000 purchase = 2x$900 + 1x$50 = 1800 + 50 = 1850 points
            const result = RewardCalculator.calculatePointsForTransaction(1000);
            expect(result).toBe(1850);
        });
    });

    describe('calculatePointsForTransaction - Negative Test Cases', () => {
        test('should throw error for negative amounts', () => {
            expect(() => {
                RewardCalculator.calculatePointsForTransaction(-10);
            }).toThrow('Invalid transaction amount: -10');
        });

        test('should throw error for non-numeric values', () => {
            expect(() => {
                RewardCalculator.calculatePointsForTransaction('invalid');
            }).toThrow('Invalid transaction amount: invalid');

            expect(() => {
                RewardCalculator.calculatePointsForTransaction(null);
            }).toThrow('Invalid transaction amount: null');

            expect(() => {
                RewardCalculator.calculatePointsForTransaction(undefined);
            }).toThrow('Invalid transaction amount: undefined');
        });

        test('should throw error for NaN values', () => {
            expect(() => {
                RewardCalculator.calculatePointsForTransaction(NaN);
            }).toThrow('Invalid transaction amount: NaN');
        });
    });

    describe('calculateTotalPoints - Positive Test Cases', () => {
        test('should calculate total points for multiple transactions', () => {
            const transactions = [
                { amount: 120 }, // 90 points
                { amount: 75 },  // 25 points
                { amount: 30 }   // 0 points
            ];
            const result = RewardCalculator.calculateTotalPoints(transactions);
            expect(result).toBe(115);
        });

        test('should handle empty transaction array', () => {
            const result = RewardCalculator.calculateTotalPoints([]);
            expect(result).toBe(0);
        });

        test('should handle fractional amounts in multiple transactions', () => {
            const transactions = [
                { amount: 125.99 }, // 101 points (floor of 2x25.99 + 50)
                { amount: 75.50 },  // 25 points (floor of 1x25.50)
                { amount: 49.99 }   // 0 points
            ];
            const result = RewardCalculator.calculateTotalPoints(transactions);
            expect(result).toBe(126);
        });
    });

    describe('calculateTotalPoints - Negative Test Cases', () => {
        test('should throw error for invalid transaction array', () => {
            expect(() => {
                RewardCalculator.calculateTotalPoints('not an array');
            }).toThrow('Transactions must be an array');

            expect(() => {
                RewardCalculator.calculateTotalPoints(null);
            }).toThrow('Transactions must be an array');
        });

        test('should skip invalid transactions and continue calculation', () => {
            const transactions = [
                { amount: 120 },     // 90 points
                { amount: 'invalid' }, // skipped
                { amount: 75 },      // 25 points
                { amount: -10 },     // skipped
                null,                // skipped
                { amount: 80 }       // 30 points
            ];
            const result = RewardCalculator.calculateTotalPoints(transactions);
            expect(result).toBe(145); // 90 + 25 + 30
        });
    });

    describe('calculateMonthlyBreakdown', () => {
        test('should group transactions by month and calculate points', () => {
            const transactions = [
                { amount: 120, date: '2025-01-15' }, // 90 points
                { amount: 75, date: '2025-01-20' },  // 25 points
                { amount: 150, date: '2025-02-10' }  // 150 points
            ];
            
            const result = RewardCalculator.calculateMonthlyBreakdown(transactions);
            
            expect(result['2025-01']).toEqual({
                points: 115,
                transactionCount: 2,
                totalAmount: 195
            });
            
            expect(result['2025-02']).toEqual({
                points: 150,
                transactionCount: 1,
                totalAmount: 150
            });
        });

        test('should handle invalid dates gracefully', () => {
            const transactions = [
                { amount: 120, date: '2025-01-15' }, // valid
                { amount: 75, date: 'invalid-date' }, // invalid date, skipped
                { amount: 150, date: null }          // null date, skipped
            ];
            
            const result = RewardCalculator.calculateMonthlyBreakdown(transactions);
            
            expect(result['2025-01']).toEqual({
                points: 90,
                transactionCount: 1,
                totalAmount: 120
            });
            
            expect(Object.keys(result)).toHaveLength(1);
        });
    });

    describe('calculatePointsWithDetails', () => {
        test('should add points and breakdown to transactions', () => {
            const transactions = [
                { transactionId: 'T1', amount: 120, date: '2025-01-15' },
                { transactionId: 'T2', amount: 75, date: '2025-01-20' }
            ];
            
            const result = RewardCalculator.calculatePointsWithDetails(transactions);
            
            expect(result[0]).toEqual({
                transactionId: 'T1',
                amount: 120,
                date: '2025-01-15',
                points: 90,
                pointsBreakdown: { highTier: 40, lowTier: 50 }
            });
            
            expect(result[1]).toEqual({
                transactionId: 'T2',
                amount: 75,
                date: '2025-01-20',
                points: 25,
                pointsBreakdown: { highTier: 0, lowTier: 25 }
            });
        });

        test('should handle invalid transactions with 0 points', () => {
            const transactions = [
                { transactionId: 'T1', amount: 'invalid' },
                { transactionId: 'T2', amount: 75 }
            ];
            
            const result = RewardCalculator.calculatePointsWithDetails(transactions);
            
            expect(result[0]).toEqual({
                transactionId: 'T1',
                amount: 'invalid',
                points: 0,
                pointsBreakdown: { highTier: 0, lowTier: 0 }
            });
            
            expect(result[1].points).toBe(25);
        });
    });

    describe('getMonthYearDisplay', () => {
        test('should format month-year correctly', () => {
            const result1 = RewardCalculator.getMonthYearDisplay('2025-01');
            expect(result1).toBe('January 2025');
            
            const result2 = RewardCalculator.getMonthYearDisplay('2024-12');
            expect(result2).toBe('December 2024');
        });

        test('should handle invalid month-year format', () => {
            const result1 = RewardCalculator.getMonthYearDisplay('invalid');
            expect(result1).toBe('Invalid Date');
            
            const result2 = RewardCalculator.getMonthYearDisplay('2025');
            expect(result2).toBe('Invalid Date');
        });
    });

    describe('isValidAmount', () => {
        test('should validate amounts correctly', () => {
            expect(RewardCalculator.isValidAmount(100)).toBe(true);
            expect(RewardCalculator.isValidAmount(0)).toBe(true);
            expect(RewardCalculator.isValidAmount(125.50)).toBe(true);
            
            expect(RewardCalculator.isValidAmount(-10)).toBe(false);
            expect(RewardCalculator.isValidAmount('invalid')).toBe(false);
            expect(RewardCalculator.isValidAmount(null)).toBe(false);
            expect(RewardCalculator.isValidAmount(undefined)).toBe(false);
            expect(RewardCalculator.isValidAmount(NaN)).toBe(false);
        });
    });

    describe('Edge Cases and Boundary Testing', () => {
        test('should handle zero amount', () => {
            const result = RewardCalculator.calculatePointsForTransaction(0);
            expect(result).toBe(0);
        });

        test('should handle very small fractional amounts', () => {
            const result = RewardCalculator.calculatePointsForTransaction(0.01);
            expect(result).toBe(0);
        });

        test('should handle amounts just below thresholds', () => {
            const result1 = RewardCalculator.calculatePointsForTransaction(49.99);
            expect(result1).toBe(0);
            
            const result2 = RewardCalculator.calculatePointsForTransaction(99.99);
            expect(result2).toBe(49); // floor of 49.99
        });

        test('should handle amounts just above thresholds', () => {
            const result1 = RewardCalculator.calculatePointsForTransaction(50.01);
            expect(result1).toBe(0); // floor of 0.01
            
            const result2 = RewardCalculator.calculatePointsForTransaction(100.01);
            expect(result2).toBe(50); // floor of 0.01 * 2 + 50
        });

        test('should handle very large amounts', () => {
            const result = RewardCalculator.calculatePointsForTransaction(999999.99);
            expect(result).toBe(1999899); // 2 * 999849.99 + 50 = floor result
        });
    });
});
