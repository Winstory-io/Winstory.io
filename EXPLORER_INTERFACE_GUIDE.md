# Explorer Interface - Modern UX/UI Guide

## Overview

The Explorer interface has been completely redesigned with modern, innovative UX/UI inspired by Netflix's mosaic video design and Apple's fluid interface philosophy. Everything is dynamic and ready for future campaigns.

## 🎨 Design Features

### 1. **Netflix-Style Carousels**
- Smooth horizontal scrolling with arrow navigation
- Auto-hiding scrollbars for clean aesthetics
- Hover effects with scale transformations
- Dynamic loading of content

### 2. **Apple-Style Fluidity**
- Cubic-bezier easing functions for natural motion
- Subtle animations and transitions
- Responsive hover states
- Gradient overlays and modern borders

### 3. **Modern Visual Elements**
- Glowing borders and shadows (yellow/gold theme)
- Gradient backgrounds and text
- Card-based layouts with depth
- Progress bars and status indicators

## 📂 Component Structure

### Core Components

#### 1. **VideoCard** (`components/Explorer/VideoCard.tsx`)
Reusable card component for displaying campaign videos.

**Props:**
```typescript
{
  video: CampaignVideo;
  onInfoClick: (video: CampaignVideo) => void;
  variant: 'carousel' | 'mosaic' | 'podium';
  size: 'small' | 'medium' | 'large';
}
```

**Features:**
- Supports both horizontal (16:9) and vertical (9:16) video orientations
- Hover effects with scale and shadow animations
- Progress bars for completion percentage
- Rank badges for podium display
- Play button overlay
- Company/creator name display

#### 2. **VideoCarousel** (`components/Explorer/VideoCarousel.tsx`)
Netflix-style horizontal scrolling carousel.

**Features:**
- Left/right arrow navigation
- Smooth scroll behavior
- Auto-detection of scroll limits
- Empty state handling
- Section titles with icons

#### 3. **VideoPodium** (`components/Explorer/VideoPodium.tsx`)
Podium display for top 3 completions.

**Features:**
- Gold/Silver/Bronze podium bases
- Animated rise-up effect
- Rank badges and titles
- Premium reward display
- Proper ordering (2nd, 1st, 3rd)

#### 4. **VideoMosaic** (`components/Explorer/VideoMosaic.tsx`)
Grid-based mosaic for all campaigns.

**Features:**
- Responsive grid layout
- Filter buttons (All, Companies, Community, Completed)
- Sort dropdown (Recent, Popular)
- Results counter
- Load more pagination
- Fade-in animations

#### 5. **CampaignInfoModal** (`components/Explorer/CampaignInfoModal.tsx`)
Detailed campaign information modal.

**Features:**
- Slide-up animation
- Backdrop blur effect
- Campaign details display
- Progress tracking
- Rewards breakdown
- Call-to-action button

## 🎯 Tab System

### Main Tabs
1. **Active Creations** - Campaigns open for completion
   - Sub-tab: Company to Complete
   - Sub-tab: Community to Complete
2. **Best Completions** - Top 3 winners from ended campaigns
3. **All** - All campaigns with filters

### Tab Features
- Smooth color transitions
- Active indicators with glow effects
- Hover states with color changes
- Uppercase styling with letter spacing

## 📊 Data Structure

### CampaignVideo Type

```typescript
export type CampaignVideo = {
  id: string;
  title: string;
  companyName?: string;              // For B2C companies
  creatorWallet?: string;            // For individual creators
  thumbnail: string;                 // Video thumbnail URL
  videoUrl: string;                  // Full video URL
  orientation: 'horizontal' | 'vertical';
  completionPercentage?: number;     // 0-100
  timeLeft?: string;                 // e.g., "5 days left"
  standardReward?: string;
  premiumReward?: string;
  completionPrice?: string;          // e.g., "0.05 USDT"
  startingStory?: string;
  guidelines?: string;
  rank?: number;                     // 1, 2, or 3 for podium
};
```

## 🔌 Integration Guide

### 1. Fetching Campaigns

Add API integration in `app/explorer/page.tsx`:

```typescript
useEffect(() => {
  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/campaigns', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      // Transform data to match CampaignVideo type
      const campaigns: CampaignVideo[] = data.map((campaign: any) => ({
        id: campaign.id,
        title: campaign.title,
        companyName: campaign.creatorInfo?.companyName,
        creatorWallet: campaign.creatorInfo?.walletAddress,
        thumbnail: campaign.content?.videoUrl + '/thumbnail.jpg', // Adjust as needed
        videoUrl: campaign.content?.videoUrl,
        orientation: campaign.content?.videoOrientation || 'horizontal',
        completionPercentage: campaign.metadata?.completionPercentage,
        timeLeft: calculateTimeLeft(campaign.metadata?.endDate),
        standardReward: campaign.rewards?.standardReward,
        premiumReward: campaign.rewards?.premiumReward,
        completionPrice: campaign.rewards?.completionPrice,
        startingStory: campaign.content?.startingStory,
        guidelines: campaign.content?.guidelines,
      }));
      
      setCampaigns(campaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchCampaigns();
}, [activeTab, activeSubTab]);
```

### 2. Filtering Logic

For **Active Creations**:
- Status: `APPROVED`
- Campaign not ended (check `endDate`)
- Completion percentage < 100%
- Filter by sub-tab:
  - Company: `creatorType === 'B2C_AGENCIES'`
  - Community: `creatorType === 'INDIVIDUAL_CREATORS'`

For **Best Completions**:
- Status: `COMPLETED`
- Campaign ended
- Top 3 completions by ranking
- Filter by: `rank IN (1, 2, 3)`

For **All**:
- All campaigns regardless of status
- Client-side filtering by category

### 3. API Endpoints to Create

```typescript
// GET /api/campaigns
// Query params: 
//   - tab: 'active' | 'best' | 'all'
//   - subTab: 'company' | 'community' (for active)
//   - limit: number
//   - offset: number

// Example response:
{
  campaigns: CampaignVideo[],
  total: number,
  hasMore: boolean
}
```

## 🎬 Empty States

All components include beautiful empty states:

- **Active Creations**: Film camera emoji with encouraging message
- **Best Completions**: Trophy emoji with podium waiting message
- **All**: Globe emoji with ecosystem launch message

## 🌟 Animation Details

### Keyframes Used

1. **fadeIn** - Modal backdrop appearance
2. **slideUp** - Modal content entrance
3. **riseUp** - Podium items entrance (staggered)
4. **fadeInUp** - Mosaic grid items entrance
5. **spin** - Loading spinner

### Transition Timings

- Quick interactions: `0.2s`
- Standard transitions: `0.3s`
- Complex animations: `0.4s` to `0.8s`
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` (Apple-style)

## 🎨 Color Palette

- **Primary Yellow**: `#FFD600`
- **Secondary Orange**: `#FFA500`
- **Success Green**: `#00FF88`
- **Accent Cyan**: `#00FFB0`
- **Error Red**: `#FF5252`
- **Background Dark**: `#000000`
- **Card Background**: `#1a1a1a` to `#0d0d0d`
- **Text Primary**: `#ffffff`
- **Text Secondary**: `#999999`
- **Text Tertiary**: `#666666`

## 🚀 Performance Considerations

1. **Lazy Loading**: Implement intersection observer for images
2. **Virtual Scrolling**: For large lists (100+ items)
3. **Image Optimization**: Use Next.js Image component
4. **Debouncing**: Search and filter operations
5. **Memoization**: Use React.memo for VideoCard

## 📱 Responsive Design

The interface is fully responsive:

- Mobile: Single column mosaic, stacked carousels
- Tablet: 2-column mosaic, scroll carousels
- Desktop: Multi-column mosaic, full carousels

Grid uses `repeat(auto-fill, minmax(280px, 1fr))` for automatic responsiveness.

## 🔮 Future Enhancements

1. **Video Preview on Hover**: Auto-play video on card hover
2. **Infinite Scroll**: Replace "Load More" with infinite scroll
3. **Advanced Filters**: Date range, reward type, creator type
4. **Search Functionality**: Full-text search in ExplorerSearchBar
5. **Bookmark System**: Save favorite campaigns
6. **Share Feature**: Share campaigns on social media
7. **Analytics**: Track views, clicks, completions

## 🛠️ Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

## 📝 Notes

- All components use inline styles for better performance and portability
- No external CSS dependencies required
- Fully typed with TypeScript
- Accessible with proper ARIA labels
- SEO-friendly with semantic HTML

## 🎯 Key Requirements Met

✅ Netflix-style mosaic and carousel design  
✅ Apple-style fluid animations  
✅ Dynamic content (no hardcoded data)  
✅ Modern borders and visual elements  
✅ Support for vertical and horizontal content  
✅ Three main sections with proper filtering  
✅ Empty states for all views  
✅ Smooth transitions throughout  
✅ Responsive design  
✅ Scalable architecture  

---

**Last Updated**: October 4, 2025  
**Version**: 1.0.0

