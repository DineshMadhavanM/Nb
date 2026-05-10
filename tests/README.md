# Selenium Automated Testing

This directory contains Selenium test scripts for the Nineteen06 POS system.

## Prerequisites

1. **Python 3.x** installed.
2. **Chrome Browser** installed.
3. Install the Selenium package:
   ```bash
   pip install selenium
   ```

## Running the Test

1. Ensure both the **Backend** and **Frontend** servers are running:
   - Backend: `npm run dev` (in /backend)
   - Frontend: `npm run dev` (in /frontend)
2. Run the test script:
   ```bash
   python tests/selenium_test.py
   ```

## Test Flow Covered

1. **Security Bypass**: Automatically enters the code `V1906gan`.
2. **POS Transaction**:
   - Adds a product to the cart.
   - Proceeds to checkout.
   - Selects **Credit** payment.
   - Sets due date to **Tomorrow**.
3. **Verification**:
   - Navigates to the Dashboard.
   - Confirms the order appears with a **Pending** status badge.
