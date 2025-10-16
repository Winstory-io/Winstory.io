# Console Logging Guide - Create Campaign Process

## Overview
This document describes all the console logging that has been added to the campaign creation process. These logs display all user-entered variables at each step when buttons are clicked.

## Purpose
- **Debug and Monitor**: Track all user inputs throughout the campaign creation flow
- **Data Verification**: Ensure all data is correctly captured and stored
- **Testing**: Facilitate testing by displaying all variables in the browser console

## How to View
1. Open your browser's Developer Tools (F12 or Right-click → Inspect)
2. Go to the "Console" tab
3. Follow the campaign creation process
4. All variables will be logged at each step with clear headers

---

## B2C Company Flow

### Step 1: Your Informations
**File**: `app/creation/b2c/yourinformations/page.tsx`
**Trigger**: Click on green arrow button

**Logged Variables**:
```
=== CREATE CAMPAIGN - Step 1: Your Informations ===
Company Name: [company name from localStorage]
Contact Email: [email from localStorage]
==========================================
```

---

### Step 2: Your Winstory
**File**: `app/creation/b2c/yourwinstory/page.tsx`
**Trigger**: Click on green arrow button (after form validation)

**Logged Variables**:
```
=== CREATE CAMPAIGN - Step 2: Your Winstory ===
Starting Title: [user entered title]
Starting Story: [user entered story]
Guideline: [user entered guideline]
==========================================
```

---

### Step 3: Your A.I. Film
**File**: `app/creation/b2c/yourfilm/page.tsx`
**Trigger**: Click on green arrow button

**Logged Variables**:
```
=== CREATE CAMPAIGN - Step 3: Your A.I. Film ===
Video File: [filename or "No video uploaded"]
Video Size: [size in MB or "N/A"]
Video Format: [horizontal/vertical or "N/A"]
Winstory Creates Film: [true/false]
==========================================
```

---

### Step 4: Rewards or Not
**File**: `components/RewardsOrNot.tsx`
**Trigger**: Click on green arrow button

**Logged Variables**:
```
=== CREATE CAMPAIGN - Step 4: Rewards or Not ===
Unit Value: [dollar amount or 0]
Net Profit: [dollar amount or 0]
Free Reward: [true/false]
No Reward: [true/false]
Max Completions: [number of completions]
==========================================
```

---

### Step 5: Standard Token Rewards (if applicable)
**File**: `app/creation/b2c/standardrewards/TokenRewardConfig.tsx`
**Trigger**: Click "Confirm Token Reward Configuration" button

**Logged Variables**:
```
=== CREATE CAMPAIGN - Step 5: Standard Token Rewards ===
Token Name: [token name]
Contract Address: [blockchain contract address]
Blockchain: [Ethereum/Polygon/etc.]
Token Standard: [ERC20/ERC1155/SPL/BRC20]
Amount Per User: [number of tokens]
Total Amount: [total tokens needed]
Has Enough Balance: [true/false]
==========================================
```

**Note**: Similar logs exist for:
- `ItemRewardConfig.tsx` - for digital items
- `DigitalExclusiveAccessConfig.tsx` - for digital exclusive access
- `PhysicalExclusiveAccessConfig.tsx` - for physical exclusive access
- Premium rewards versions in `app/creation/b2c/premiumrewards/`

---

### Step 6: MINT & Payment
**File**: `app/creation/b2c/mint/page.tsx`
**Trigger**: Click on any payment method button

**Logged Variables**:
```
=== CREATE CAMPAIGN - Step 6: MINT & Payment ===
Payment Method Selected: [USDC_Base/Credit_Card/Stripe/PayPal/Google_Pay/Apple_Pay]
Total Price: [amount in USD]
Pricing Options: [array of selected options]
User Email: [user email]
==========================================
```

---

### Final Recap
**File**: `app/creation/b2c/recap/page.tsx`
**Trigger**: Click "Confirm and MINT" button

**Logged Variables**:
```
=== CREATE CAMPAIGN - FINAL RECAP ===
--- User Information ---
Email: [email]
Company Name: [company name]
--- Story Information ---
Title: [title]
Starting Story: [story text]
Guideline: [guideline text]
--- Film Information ---
AI Film Requested: [true/false]
Video File: [filename or "No video file"]
Video Format: [horizontal/vertical]
--- ROI/Rewards Data ---
Unit Value: [amount]
Net Profit: [amount]
Max Completions: [number]
Free Reward: [true/false]
No Reward: [true/false]
--- Standard Rewards ---
[If configured]
Standard Token: [token name]
  - Contract: [address]
  - Blockchain: [chain]
  - Amount per user: [amount]
Standard Item: [item name]
  - Contract: [address]
  - Blockchain: [chain]
  - Amount per user: [amount]
--- Premium Rewards ---
[If configured]
Premium Token: [token name]
  - Contract: [address]
  - Blockchain: [chain]
  - Amount per user: [amount]
Premium Item: [item name]
  - Contract: [address]
  - Blockchain: [chain]
  - Amount per user: [amount]
==========================================
Proceeding to MINT page...
==========================================
```

---

## Individual Creator Flow

### Step 1: Your Winstory
**File**: `app/creation/individual/yourwinstory/page.tsx`
**Trigger**: Click on green arrow button

**Logged Variables**:
```
=== CREATE CAMPAIGN (Individual) - Step 1: Your Winstory ===
Starting Title: [user entered title]
Starting Story: [user entered story]
Guideline: [user entered guideline]
==========================================
```

---

### Step 2: Your Film
**File**: `app/creation/individual/yourfilm/page.tsx`
**Trigger**: Click on green arrow button

**Logged Variables**:
```
=== CREATE CAMPAIGN (Individual) - Step 2: Your Film ===
Video File: [filename or "No video uploaded"]
Video Size: [size in MB or "N/A"]
Video Format: [horizontal/vertical or "N/A"]
==========================================
```

---

## Agency B2C Flow

The Agency B2C flow follows a similar pattern to the B2C Company flow with additional steps for agency and client information. The same logging structure applies to:
- `app/creation/agencyb2c/page.tsx`
- `app/creation/agencyb2c/yourinformations/page.tsx`
- `app/creation/agencyb2c/yourwinstory/page.tsx`
- `app/creation/agencyb2c/yourfilm/page.tsx`
- And all corresponding reward configuration pages

---

## Usage Tips

### For Developers
1. **Testing**: Open the console before starting the campaign creation process
2. **Debugging**: Check if all variables are correctly captured at each step
3. **Data Validation**: Verify that the data matches what the user entered

### For QA
1. Use these logs to verify that user data is correctly captured
2. Check that all fields are populated when expected
3. Verify that the flow follows the correct sequence

### Console Filtering
To filter logs in the browser console:
```
Filter: "CREATE CAMPAIGN"
```
This will show only the campaign creation logs.

---

## Log Format

All logs follow a consistent format:
```
=== CREATE CAMPAIGN - [Step Name] ===
Variable Name: Value
Another Variable: Value
==========================================
```

- **Header**: Clearly identifies the step with `===` separators
- **Variables**: Each variable is on its own line with name and value
- **Footer**: Closes the log section with `===` separators

---

## Files Modified

### B2C Company Flow
1. `app/creation/b2c/yourinformations/page.tsx`
2. `app/creation/b2c/yourwinstory/page.tsx`
3. `app/creation/b2c/yourfilm/page.tsx`
4. `components/RewardsOrNot.tsx`
5. `app/creation/b2c/standardrewards/TokenRewardConfig.tsx`
6. `app/creation/b2c/recap/page.tsx`
7. `app/creation/b2c/mint/page.tsx`

### Individual Creator Flow
1. `app/creation/individual/yourwinstory/page.tsx`
2. `app/creation/individual/yourfilm/page.tsx`

### Additional Files (if you configure other reward types)
- `app/creation/b2c/standardrewards/ItemRewardConfig.tsx`
- `app/creation/b2c/standardrewards/DigitalExclusiveAccessConfig.tsx`
- `app/creation/b2c/standardrewards/PhysicalExclusiveAccessConfig.tsx`
- `app/creation/b2c/premiumrewards/TokenRewardConfig.tsx`
- `app/creation/b2c/premiumrewards/ItemRewardConfig.tsx`
- Similar files in `app/creation/agencyb2c/`

---

## Example Console Output

Here's what a complete campaign creation process would look like in the console:

```
=== CREATE CAMPAIGN - Step 1: Your Informations ===
Company Name: Nike
Contact Email: contact@nike.com
==========================================

=== CREATE CAMPAIGN - Step 2: Your Winstory ===
Starting Title: Just Do It - The Beginning
Starting Story: In a world where dreams meet determination...
Guideline: Focus on inspiring and motivational content...
==========================================

=== CREATE CAMPAIGN - Step 3: Your A.I. Film ===
Video File: nike_campaign.mp4
Video Size: 15.34 MB
Video Format: horizontal
Winstory Creates Film: false
==========================================

=== CREATE CAMPAIGN - Step 4: Rewards or Not ===
Unit Value: 25
Net Profit: 5000
Free Reward: false
No Reward: false
Max Completions: 440
==========================================

=== CREATE CAMPAIGN - Step 5: Standard Token Rewards ===
Token Name: USDC
Contract Address: 0x...
Blockchain: Ethereum
Token Standard: ERC20
Amount Per User: 10
Total Amount: 4400.00000
Has Enough Balance: true
==========================================

=== CREATE CAMPAIGN - Step 6: MINT & Payment ===
Payment Method Selected: Stripe
Total Price: 1000 USD
Pricing Options: []
User Email: contact@nike.com
==========================================

=== CREATE CAMPAIGN - FINAL RECAP ===
[... complete summary ...]
==========================================
```

---

## Notes

- All logs use `console.log()` which appears in the standard browser console
- Variables are captured from React state and localStorage
- Logs only appear when buttons are clicked (on form submission)
- No sensitive payment information is logged
- Logs are only visible in development/testing environments

---

## Maintenance

When adding new fields to the campaign creation process:
1. Add corresponding console.log statements in the button click handlers
2. Follow the same format: `console.log('Variable Name:', value)`
3. Use the same header/footer format for consistency
4. Update this documentation

---

Last Updated: 2025-01-16
Version: 1.0

