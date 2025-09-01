# Rewards Program Calculator

## Overview

This is a vanilla JavaScript application that calculates customer reward points based on transaction history. The application implements a retailer's rewards program where customers earn points based on purchase amounts: 2 points for every dollar spent over $100, plus 1 point for every dollar spent between $50-$100 per transaction. The system provides a comprehensive dashboard for viewing customer rewards with monthly breakdowns, transaction details, and advanced filtering capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Pure Vanilla JavaScript**: Built without frameworks using ES6 modules for clean code organization
- **Modular Design**: Separated into focused modules (CustomerManager, FilterManager, PaginationManager, UIManager, DataService, RewardCalculator)
- **Event-Driven Architecture**: Uses centralized event handling and callback patterns for component communication
- **Responsive Design**: Mobile-first CSS approach with flexbox/grid layouts

### Data Management
- **Mock Data Service**: Simulates API calls with async/await patterns, loading states, and error handling
- **JSON Data Storage**: Customer and transaction data stored in static JSON files under `public/data/`
- **Client-Side Processing**: All reward calculations and data filtering performed in the browser
- **Caching Strategy**: Implements in-memory caching to avoid redundant data loading

### Business Logic
- **Reward Calculation Engine**: Centralized RewardCalculator class implementing the business rules (2x points over $100, 1x points $50-$100)
- **Date Filtering**: Supports "Last 3 Months" default view with month/year dropdown filters (2021-2025)
- **Pagination System**: Handles large transaction datasets with configurable page sizes
- **Data Validation**: Input sanitization and null/undefined guards throughout

### User Interface
- **State Management**: UIManager handles all DOM manipulation and UI state
- **Loading States**: Spinner and error states for better user experience
- **Accessibility**: WCAG compliant with keyboard navigation support
- **Progressive Enhancement**: Graceful degradation for different browser capabilities

### Testing Strategy
- **Jest Framework**: Unit testing with positive and negative test cases
- **Test Coverage**: Comprehensive testing of reward calculation logic including fractional values
- **Mock Implementation**: Isolated testing with mocked dependencies

## External Dependencies

### JavaScript Libraries
- **Pino**: Logging library for structured application logging with configurable levels
- **Jest**: Testing framework for unit tests and test coverage
- **Font Awesome**: Icon library via CDN for UI enhancement

### Data Sources
- **Static JSON Files**: Customer and transaction data served from `public/data/` directory
- **Fetch API**: Browser-native HTTP client for simulated API interactions

### Browser APIs
- **DOM APIs**: Standard browser APIs for element manipulation and event handling
- **Local Storage**: Potential for caching (architecture supports but not currently implemented)
- **Console API**: Fallback logging when Pino is unavailable

### Development Tools
- **ES6 Modules**: Native browser module system for code organization
- **JSDoc**: Documentation generation and type hints
- **CSS3**: Modern styling features including flexbox, grid, and custom properties

The application follows a clean separation of concerns with each module having a single responsibility, making it maintainable and testable while providing a rich user experience for managing customer rewards.