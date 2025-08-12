# Moderation Page Improvements

## Overview

The moderation page has been completely refactored to provide an optimal experience for moderators, with clear distinction between different content types and detailed guidelines to help guide decisions.

## New Features

### 1. Sub-tab Structure

#### "Initial" Tab
- **B2C & Agencies**: Company content with 4 information bubbles
  - Premium Reward
  - Standard Reward  
  - Guideline
  - Starting Story
- **Individual Creators**: Individual creator content with 2 bubbles
  - Guideline
  - Starting Story

#### "Completion" Tab
- **For B2C**: Completions for B2C campaigns
- **For Individuals**: Completions for individual creators

### 2. Brand Information Display

- **B2C Companies**: Company name displayed above video with company.svg icon
- **Agencies**: Agency name AND client company name displayed with company.svg icons
- **Individual Creators**: Individual.svg icon (48x48px) with truncated wallet address (no redundant title)

### 3. Adaptive Moderation Bubbles

- **B2C & Agencies**: 4 bubbles with all information (including rewards)
- **Individual Creators**: 2 bubbles only (no rewards)

### 4. Dynamic Progress Panel

- **Stakers**: Dynamic progression of number of stakers who have voted
- **Staked Amount**: Dynamic comparison with MINT price
- **Vote Results**: 2:1 ratio required with dynamic colors
  - Green: Ratio achieved (≥67% positive votes)
  - Red: Ratio not achieved (<67% positive votes)

### 5. Enhanced Moderation Guidelines

#### For Initial Stories
- **Validation Criteria**: Moderation standards, narrative coherence, rule compliance
- **Refusal Criteria**: Incomplete content, hate speech, deepfakes, geopolitical risks, etc.
- **Warnings**: Impact on staked WINC and decision consequences

#### For Completions
- **Validation and Scoring**: Score from 0/100 to 100/100 with reward system
- **Specific Criteria**: Guideline compliance, generative AI usage, etc.

### 6. Visual Branding with SVG Icons

- **Company Icon (company.svg)**: 48x48px for B2C companies, 40x40px for agencies
- **Individual Icon (individual.svg)**: 48x48px for individual creators
- **Wallet Address Display**: Truncated wallet address for individual creators in monospace font

### 7. Professional Moderation Tooltip

- **Comprehensive Guide**: Complete moderation guide accessible via the yellow bulb icon
- **Interactive Design**: Professional modal with sections, grids, and visual hierarchy
- **Content Sections**: Overview, Content Types, Moderation Criteria, Tools & Features, Best Practices
- **Visual Elements**: Color-coded criteria, icons, responsive grid layout
- **Best Practices**: Practical advice for consistent and effective moderation

## Created Components

### 1. `ModeratorHeader`
- Main tab and sub-tab management
- Intuitive user interface with clear navigation

### 2. `BrandInfo`
- Conditional display of brand information
- Adaptive design based on user type
- SVG icon integration with proper sizing
- Wallet address display for individual creators (without redundant title)

### 3. `ModerationBubbles`
- Adaptive information bubbles based on content type
- User interactions and animations

### 4. `ModerationProgressPanel`
- Dynamic progress panel
- Automatic ratio and percentage calculations

### 5. `ModerationButtons`
- Validation/refusal buttons with informative popups
- Detailed guidelines for each decision type

### 6. `MockModerationData`
- Test data for all scenarios
- Realistic simulation of different content types

### 7. `ModerationTooltip`
- Professional moderation guide with comprehensive information
- Interactive sections covering all aspects of moderation
- Best practices and criteria for effective decision-making

## Technical Improvements

### 1. Modular Architecture
- Reusable and maintainable components
- Clear separation of responsibilities

### 2. State Management
- Local states for dynamic data
- Automatic update of progress information

### 3. TypeScript Types
- Strict interfaces for type safety
- Optional property management

### 4. Responsive Design
- Automatic adaptation to video size
- Consistent user interface across all screen sizes

### 5. SVG Icon Integration
- Scalable vector graphics for crisp display
- Consistent sizing across different user types
- Proper alt text for accessibility

## Usage

### Navigation
1. **Change Tab**: Click on "Initial" or "Completion"
2. **Change Sub-tab**: Click on corresponding sub-tabs
3. **Access Information**: Click on information bubbles

### Moderation
1. **Review Information**: Use bubbles and information button
2. **Make Decision**: Click on "Valid" or "Refuse"
3. **Review Guidelines**: Read informative popups
4. **Score Completions**: Use 0-100 scoring system

## Mock Data

### Available Scenarios
- **B2C**: Direct company with rewards
- **Agency**: Creative agency for B2C client
- **Individual**: Individual creator without rewards

### Dynamic Progression
- Variable staker count (10-19)
- Variable staked amount (1000-1499 $WINC)
- Real-time votes with automatic updates

## Maintenance and Evolution

### Future Additions
- Blockchain integration for real data
- Notification system for new content
- Moderation decision history
- Moderator performance metrics

### Optimizations
- Progress data caching
- Component lazy loading
- React re-render optimization

## Conclusion

This refactoring transforms the moderation page into a professional and intuitive tool, providing moderators with all the necessary information to make informed decisions while respecting Winstory's quality standards. The addition of SVG icons and wallet address display further enhances the visual distinction between different user types. 