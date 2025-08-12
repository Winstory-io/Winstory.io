# Completion Scoring System - Winstory.io

## Overview

The completion scoring system allows moderators (WINC token stakers) to validate and score community-submitted complementary content. This system is inspired by the reference page `04_Moderate Completion` and integrates into the "Completion" tab of the moderation page.

## Main Features

### 1. Scoring System (0-100/100)
- **Interactive slider**: Allows assigning a score from 0 to 100
- **Unique scores**: Each score can only be used once per campaign
- **Visual markers**: Already used scores are marked on the slider
- **Dynamic descriptions**: Quality description changes based on the score

### 2. Content Type Differentiation
- **B2C Creation**: Company content
- **Agency B2C**: Agency content for companies
- **Individual Creation**: Individual creator content

### 3. Dynamic Statistics
- **Staker count**: Real-time display of active voters
- **Staked amounts**: Dynamic comparison with MINT price
- **Voting results**: Required ratios and current votes
- **Auto-update**: Refresh every 30 seconds

## Component Architecture

### Main Components

#### `CompletionScoringModal`
- Scoring modal with interactive slider
- Validation of already used scores
- Responsive and intuitive interface

#### `ModerationStats`
- Display of moderation statistics
- Dynamic progress bars
- Visual differentiation by content type

#### `CompletionInfo`
- Initial campaign information
- Quick access bubbles to details
- Content type display

#### `CompletionVideo`
- Completion video player
- Moderation controls (Valid & Score / Refuse)
- Access bubble to completion text

#### `CompletionInfoPopup`
- Information popups for each content type
- Video support for initial film
- Interface consistent with global design

### Custom Hook

#### `useModeration`
- Management of moderation data
- API functions for decisions
- Automatic statistics updates
- Completion score management

## Moderation Flow

### 1. Completion Validation
1. User clicks "Valid & Score"
2. Scoring modal opens
3. User selects an available score (0-100)
4. Score is validated and recorded
5. Score becomes unavailable for future completions

### 2. Completion Rejection
1. User clicks "Refuse"
2. Decision is recorded
3. Voting statistics are updated

### 3. Information Consultation
1. User clicks on an information bubble
2. Corresponding popup opens
3. Campaign details are displayed

## Reward System

### Top 3 Completions
- The 3 best-scored completions receive **Premium Rewards**
- The scoring system automatically identifies the best contributions
- Each score is unique per campaign, ensuring fair evaluation

### Staking and Rewards
- Moderator gains/losses are proportional to their participation in the WINC pool
- Moderation decisions engage a proportional part of their stake
- Reward system based on vote consistency with the majority

## Configuration and Customization

### Dynamic Parameters
- **Minimum staker count**: Configurable based on needs
- **Required vote ratio**: Adaptable (2:1, 3:1, etc.)
- **MINT price**: Variable per campaigns
- **Used scores**: Automatic management of available scores

### Responsive Design
- Interface adapted to different screen sizes
- Components optimized for mobile and desktop
- Intuitive navigation on all devices

## Technical Integration

### Technologies Used
- **React 18** with custom hooks
- **TypeScript** for type safety
- **CSS Modules** for modular styling
- **Styled JSX** for components with integrated styles

### Data Structure
```typescript
interface CompletionData {
  contentType: 'b2c' | 'agency' | 'individual';
  companyName?: string;
  agencyName?: string;
  campaignTitle: string;
  startingText: string;
  guideline: string;
  standardRewards: string;
  premiumRewards: string;
  completingText: string;
  videoUrl: string;
  usedScores: number[];
}
```

### API Endpoints (to implement)
- `POST /api/moderation/complete`: Score submission
- `POST /api/moderation/decision`: Moderation decision
- `GET /api/moderation/stats`: Real-time statistics

## Usage

### For Moderators
1. Navigate to `/moderation`
2. Select the "Completion" tab
3. Examine completion content
4. Consult campaign information via bubbles
5. Validate and score or reject content

### For Developers
1. Components are reusable and modular
2. `useModeration` hook centralizes business logic
3. TypeScript types ensure data consistency
4. System is extensible for new features

## Future Developments

### Planned Features
- **Reputation system** for moderators
- **Decision history** with traceability
- **Real-time notifications** for new completions
- **Admin interface** for configuration

### Technical Improvements
- **WebSocket** for real-time updates
- **Smart caching** for frequently accessed data
- **Automated tests** for component validation
- **Performance monitoring** and usage analytics

## Support and Maintenance

### Debugging
- Detailed console logs for development
- Robust error handling with fallbacks
- Data validation at each step

### Performance
- Lazy loading of heavy components
- React re-render optimization
- Static data caching

---

*This completion scoring system represents a major evolution of the Winstory.io platform, enabling fair and transparent moderation of community content.* 