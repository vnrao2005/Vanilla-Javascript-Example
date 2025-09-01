/**
 * Unit tests for DataService
 * Tests data loading, validation, and filtering functionality
 * @module DataServiceTests
 */

import { DataService } from '../src/dataService.js';

// Mock logger to avoid console output during tests
jest.mock('../src/logger.js', () => ({
    default: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
    }
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('DataService', () => {
    let dataService;

    beforeEach(() => {
        dataService = new DataService();
        fetch.mockClear();
    });

    describe('loadCustomers - Positive Test Cases', () => {
        test('should load and validate customers data successfully', async () => {
            const mockCustomers = [
                {
                    customerId: 'CUST001',
                    name: 'John Doe',
                    email: 'john@email.com',
                    joinDate: '2021-01-15'
                },
                {
                    customerId: 'CUST002',
                    name: 'Jane Smith',
                    email: 'jane@email.com',
                    joinDate: '2021-02-20'
                }
            ];

            fetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockCustomers)
            });

            const result = await dataService.loadCustomers();
            
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                customerId: 'CUST001',
                name: 'John Doe',
                email: 'john@email.com',
                joinDate: '2021-01-15'
            });
        });

        test('should return cached customers on second call', async () => {
            const mockCustomers = [
                { customerId: 'CUST001', name: 'John Doe' }
            ];

            fetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockCustomers)
            });

            // First call
            await dataService.loadCustomers();
            
            // Second call should use cache
            const result = await dataService.loadCustomers();
            
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(result).toHaveLength(1);
        });

        test('should handle customers with missing optional fields', async () => {
            const mockCustomers = [
                {
                    customerId: 'CUST001',
                    name: 'John Doe'
                    // missing email and joinDate
                }
            ];

            fetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockCustomers)
            });

            const result = await dataService.loadCustomers();
            
            expect(result[0]).toEqual({
                customerId: 'CUST001',
                name: 'John Doe',
                email: '',
                joinDate: ''
            });
        });
    });

    describe('loadCustomers - Negative Test Cases', () => {
        test('should throw error when fetch fails', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404
            });

            await expect(dataService.loadCustomers()).rejects.toThrow(
                'Failed to load customers data: HTTP error! status: 404'
            );
        });

        test('should throw error when response is not valid JSON', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockRejectedValueOnce(new Error('Invalid JSON'))
            });

            await expect(dataService.loadCustomers()).rejects.toThrow(
                'Failed to load customers data: Invalid JSON'
            );
        });

        test('should throw error when data is not an array', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce({ not: 'an array' })
            });

            await expect(dataService.loadCustomers()).rejects.toThrow(
                'Failed to load customers data: Invalid customers data format'
            );
        });

        test('should throw error when no valid customers found', async () => {
            const mockCustomers = [
                { invalidCustomer: 'missing required fields' },
                { customerId: '', name: '' } // invalid data
            ];

            fetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockCustomers)
            });

            await expect(dataService.loadCustomers()).rejects.toThrow(
                'Failed to load customers data: No valid customer data found'
            );
        });

        test('should handle network errors', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(dataService.loadCustomers()).rejects.toThrow(
                'Failed to load customers data: Network error'
            );
        });
    });

    describe('loadTransactions - Positive Test Cases', () => {
        test('should load and validate transactions data successfully', async () => {
            const mockTransactions = [
                {
                    transactionId: 'TXN001',
                    customerId: 'CUST001',
                    amount: 125.50,
                    date: '2025-01-15'
                },
                {
                    transactionId: 'TXN002',
                    customerId: 'CUST002',
                    amount: 75.25,
                    date: '2025-01-20'
                }
            ];

            fetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockTransactions)
            });

            const result = await dataService.loadTransactions();
            
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                transactionId: 'TXN001',
                customerId: 'CUST001',
                amount: 125.50,
                date: '2025-01-15'
            });
        });

        test('should return cached transactions on second call', async () => {
            const mockTransactions = [
                {
                    transactionId: 'TXN001',
                    customerId: 'CUST001',
                    amount: 100,
                    date: '2025-01-15'
                }
            ];

            fetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockTransactions)
            });

            // First call
            await dataService.loadTransactions();
            
            // Second call should use cache
            const result = await dataService.loadTransactions();
            
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(result).toHaveLength(1);
        });
    });

    describe('loadTransactions - Negative Test Cases', () => {
        test('should skip transactions with invalid data', async () => {
            const mockTransactions = [
                {
                    transactionId: 'TXN001',
                    customerId: 'CUST001',
                    amount: 125.50,
                    date: '2025-01-15'
                },
                {
                    // missing required fields
                    transactionId: 'TXN002'
                },
                {
                    transactionId: 'TXN003',
                    customerId: 'CUST002',
                    amount: 'invalid', // invalid amount
                    date: '2025-01-20'
                },
                {
                    transactionId: 'TXN004',
                    customerId: 'CUST003',
                    amount: 75.25,
                    date: 'invalid-date' // invalid date
                }
            ];

            fetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockTransactions)
            });

            const result = await dataService.loadTransactions();
            
            // Only first transaction should be valid
            expect(result).toHaveLength(1);
            expect(result[0].transactionId).toBe('TXN001');
        });

        test('should throw error when no valid transactions found', async () => {
            const mockTransactions = [
                { invalidTransaction: 'missing required fields' }
            ];

            fetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockTransactions)
            });

            await expect(dataService.loadTransactions()).rejects.toThrow(
                'Failed to load transactions data: No valid transaction data found'
            );
        });
    });

    describe('getCustomerById', () => {
        beforeEach(async () => {
            const mockCustomers = [
                { customerId: 'CUST001', name: 'John Doe' },
                { customerId: 'CUST002', name: 'Jane Smith' }
            ];

            fetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockCustomers)
            });

            await dataService.loadCustomers();
        });

        test('should return customer when found', () => {
            const result = dataService.getCustomerById('CUST001');
            expect(result).toEqual({
                customerId: 'CUST001',
                name: 'John Doe',
                email: '',
                joinDate: ''
            });
        });

        test('should return null when customer not found', () => {
            const result = dataService.getCustomerById('CUST999');
            expect(result).toBeNull();
        });

        test('should return null for empty customer ID', () => {
            const result = dataService.getCustomerById('');
            expect(result).toBeNull();
        });
    });

    describe('getTransactionsForCustomer', () => {
        beforeEach(async () => {
            const mockTransactions = [
                {
                    transactionId: 'TXN001',
                    customerId: 'CUST001',
                    amount: 125.50,
                    date: '2025-01-15'
                },
                {
                    transactionId: 'TXN002',
                    customerId: 'CUST001',
                    amount: 75.25,
                    date: '2025-02-20'
                },
                {
                    transactionId: 'TXN003',
                    customerId: 'CUST002',
                    amount: 100.00,
                    date: '2025-01-10'
                }
            ];

            fetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockTransactions)
            });

            await dataService.loadTransactions();
        });

        test('should return transactions for specific customer', () => {
            const result = dataService.getTransactionsForCustomer('CUST001');
            expect(result).toHaveLength(2);
            expect(result[0].customerId).toBe('CUST001');
            expect(result[1].customerId).toBe('CUST001');
        });

        test('should return empty array for customer with no transactions', () => {
            const result = dataService.getTransactionsForCustomer('CUST999');
            expect(result).toEqual([]);
        });

        test('should return empty array for empty customer ID', () => {
            const result = dataService.getTransactionsForCustomer('');
            expect(result).toEqual([]);
        });

        test('should filter transactions by month and year', () => {
            const result = dataService.getTransactionsForCustomer('CUST001', {
                month: '01',
                year: '2025'
            });
            
            expect(result).toHaveLength(1);
            expect(result[0].transactionId).toBe('TXN001');
        });

        test('should handle last3 months filter', () => {
            const result = dataService.getTransactionsForCustomer('CUST001', {
                month: 'last3'
            });
            
            // Should return transactions from last 3 months
            expect(result).toHaveLength(2);
        });
    });

    describe('clearCache', () => {
        test('should clear all cached data', async () => {
            const mockCustomers = [{ customerId: 'CUST001', name: 'John' }];
            const mockTransactions = [{ transactionId: 'TXN001', customerId: 'CUST001', amount: 100, date: '2025-01-15' }];

            fetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: jest.fn().mockResolvedValueOnce(mockCustomers)
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: jest.fn().mockResolvedValueOnce(mockTransactions)
                });

            // Load data
            await dataService.loadCustomers();
            await dataService.loadTransactions();

            // Clear cache
            dataService.clearCache();

            // Verify data is cleared
            expect(dataService.getCustomers()).toEqual([]);
            expect(dataService.getTransactionsForCustomer('CUST001')).toEqual([]);
        });
    });

    describe('isDataLoading', () => {
        test('should return loading state correctly', async () => {
            const mockCustomers = [{ customerId: 'CUST001', name: 'John' }];

            fetch.mockImplementationOnce(() => 
                new Promise(resolve => {
                    setTimeout(() => {
                        resolve({
                            ok: true,
                            json: jest.fn().mockResolvedValueOnce(mockCustomers)
                        });
                    }, 100);
                })
            );

            expect(dataService.isDataLoading()).toBe(false);

            const loadPromise = dataService.loadCustomers();
            expect(dataService.isDataLoading()).toBe(true);

            await loadPromise;
            expect(dataService.isDataLoading()).toBe(false);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        test('should handle empty arrays gracefully', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce([])
            });

            await expect(dataService.loadCustomers()).rejects.toThrow(
                'No valid customer data found'
            );
        });

        test('should handle malformed JSON gracefully', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockRejectedValueOnce(new SyntaxError('Unexpected token'))
            });

            await expect(dataService.loadCustomers()).rejects.toThrow(
                'Failed to load customers data: Unexpected token'
            );
        });

        test('should validate date formats in transactions', async () => {
            const mockTransactions = [
                {
                    transactionId: 'TXN001',
                    customerId: 'CUST001',
                    amount: 100,
                    date: '2025-13-45' // invalid date
                },
                {
                    transactionId: 'TXN002',
                    customerId: 'CUST001',
                    amount: 100,
                    date: '2025-01-15' // valid date
                }
            ];

            fetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValueOnce(mockTransactions)
            });

            const result = await dataService.loadTransactions();
            
            // Only transaction with valid date should be included
            expect(result).toHaveLength(1);
            expect(result[0].transactionId).toBe('TXN002');
        });
    });
});
