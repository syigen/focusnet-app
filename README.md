# FocusNest 🎯

**Master your Day with FocusNest** - A beautiful, production-ready time-blocking and focus management app built with React Native and Expo.

![FocusNest Banner](https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

## 🌟 Overview

FocusNest is a comprehensive productivity app that helps you master your day through intelligent time-blocking, deep focus sessions, and reflective learning. Built with modern React Native and Expo technologies, it offers a seamless experience across all platforms.

### ✨ Key Features

- **🎯 Time Blocking**: Create and manage focused work sessions with specific tasks
- **⚡ Deep Focus Mode**: Immersive, distraction-free focus sessions with timer
- **📊 Weekly Analytics**: Track your productivity patterns and progress
- **💭 Daily Reflection**: Learn from your sessions and improve over time
- **🎨 Beautiful Design**: Apple-level aesthetics with smooth animations
- **🌙 Dark/Light Mode**: Adaptive theming for any environment
- **📱 Cross-Platform**: Works seamlessly on iOS, Android, and Web

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/focusnest.git
cd focusnest

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Platform-Specific Setup

```bash
# iOS (requires macOS and Xcode)
npm run ios

# Android (requires Android Studio)
npm run android

# Web
npm run web
```

## 📱 App Structure

### Core Screens

#### 🏠 **Today Screen** (`app/(tabs)/index.tsx`)
- View and manage today's time blocks
- Quick actions for creating blocks
- Real-time progress tracking
- Swipe gestures for editing/deleting blocks

#### ⚡ **Focus Screen** (`app/(tabs)/focus.tsx`)
- Start and manage focus sessions
- View active and upcoming blocks
- Track completion statistics
- Seamless transition to Focus Mode

#### 📅 **Weekly Screen** (`app/(tabs)/weekly.tsx`)
- Weekly overview and analytics
- Category-based time tracking
- Progress insights and trends
- Export and sharing capabilities

#### 💭 **Reflect Screen** (`app/(tabs)/reflect.tsx`)
- Daily reflection on completed sessions
- Rating and feedback system
- Learning insights and patterns
- Historical reflection viewing

#### ⚙️ **Settings Screen** (`app/(tabs)/settings.tsx`)
- Theme and appearance customization
- Category management
- Data management tools
- Working hours configuration

### Special Views

#### 🎯 **Focus Mode** (`components/FocusTimer.tsx`)
- **Completely separate view** - No tab bar interference
- Immersive full-screen timer experience
- Motivational quotes and progress tracking
- Intuitive controls (play/pause/reset/exit)

## 🏗️ Technical Architecture

### Framework & Tools
- **React Native 0.79.1** - Cross-platform mobile development
- **Expo SDK 53** - Development platform and tools
- **Expo Router 5** - File-based navigation system
- **TypeScript** - Type-safe development
- **AsyncStorage** - Local data persistence

### Key Libraries
- **Lucide React Native** - Beautiful, consistent icons
- **React Native Gesture Handler** - Native gesture handling
- **React Native Reanimated** - Smooth animations
- **React Native Safe Area Context** - Safe area management

### Data Management
- **Local Storage**: AsyncStorage for offline-first experience
- **Type-Safe Models**: Comprehensive TypeScript interfaces
- **Data Persistence**: Automatic saving and loading
- **Sample Data**: Built-in examples for new users

## 📊 Data Models

### TimeBlock
```typescript
interface TimeBlockData {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (24-hour)
  endTime: string; // HH:MM (24-hour)
  category: string;
  color: string;
  tasks: string[];
  isActive: boolean;
  isCompleted: boolean;
  progress?: number;
}
```

### Category
```typescript
interface BlockCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}
```

### Reflection
```typescript
interface DailyReflection {
  date: string;
  blockId: string;
  blockTitle: string;
  reflection: string;
  rating: number; // 1-5 stars
}
```

## 🎨 Design System

### Color Palette
- **Primary**: `#FF6B35` (Vibrant Orange)
- **Secondary**: `#2E8B8B` (Teal)
- **Accent**: `#8B4F9F` (Purple)
- **Success**: `#4CAF50` (Green)
- **Warning**: `#FFB800` (Amber)
- **Error**: `#FF4444` (Red)

### Typography
- **Headings**: 700 weight, optimized sizing
- **Body**: 500-600 weight for readability
- **Captions**: 400-500 weight, secondary colors

### Spacing System
- **Base Unit**: 8px
- **Consistent Gaps**: 8px, 12px, 16px, 20px, 24px, 32px
- **Safe Areas**: Automatic handling for all devices

## 🔧 Key Features Deep Dive

### 1. Time Block Management
- **Smart Creation**: Intuitive form with time validation
- **Task Management**: Up to 5 tasks per block
- **Category System**: Color-coded organization
- **Flexible Editing**: In-place editing with swipe gestures

### 2. Focus Mode Experience
- **Immersive Design**: Full-screen, distraction-free interface
- **Smart Controls**: Context-aware play/pause/reset/exit
- **Progress Tracking**: Visual progress bar and completion percentage
- **Motivational Elements**: Rotating inspirational quotes

### 3. Analytics & Insights
- **Daily Stats**: Completion rates and focus time
- **Weekly Trends**: Category breakdown and patterns
- **Visual Progress**: Charts and progress indicators
- **Export Options**: Share summaries and achievements

### 4. Reflection System
- **Structured Reflection**: Guided prompts for meaningful insights
- **Rating System**: 5-star rating for session quality
- **Historical View**: Track learning and improvement over time
- **Pattern Recognition**: Identify what works best

## 🛠️ Development

### Project Structure
```
focusnest/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── index.tsx      # Today screen
│   │   ├── focus.tsx      # Focus management
│   │   ├── weekly.tsx     # Weekly analytics
│   │   ├── reflect.tsx    # Daily reflection
│   │   ├── settings.tsx   # App settings
│   │   └── create-block.tsx # Block creation
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── TimeBlock.tsx      # Time block component
│   ├── FocusTimer.tsx     # Focus mode timer
│   ├── MobileHeader.tsx   # Header component
│   └── ClockTimePicker.tsx # Time picker
├── contexts/              # React contexts
│   └── ThemeContext.tsx   # Theme management
├── utils/                 # Utility functions
│   └── storage.ts         # Data persistence
└── hooks/                 # Custom hooks
    └── useFrameworkReady.ts
```

### Code Quality
- **TypeScript**: 100% type coverage
- **ESLint**: Consistent code style
- **Prettier**: Automatic formatting
- **Component Architecture**: Modular, reusable components

### Performance Optimizations
- **Lazy Loading**: Efficient component loading
- **Gesture Optimization**: Native gesture handling
- **Memory Management**: Proper cleanup and disposal
- **Animation Performance**: Hardware-accelerated animations

## 📱 Platform Support

### iOS
- ✅ Native navigation feel
- ✅ Safe area handling
- ✅ Haptic feedback (when available)
- ✅ iOS-specific design patterns

### Android
- ✅ Material Design elements
- ✅ Android navigation patterns
- ✅ Status bar management
- ✅ Back button handling

### Web
- ✅ Responsive design
- ✅ Keyboard navigation
- ✅ Mouse/touch interactions
- ✅ Progressive Web App ready

## 🔒 Data & Privacy

### Local-First Architecture
- **Offline Capability**: Full functionality without internet
- **Data Ownership**: All data stored locally on device
- **No Tracking**: Zero analytics or user tracking
- **Privacy Focused**: No data collection or sharing

### Data Management
- **Automatic Backup**: Local storage with AsyncStorage
- **Export Options**: JSON export for data portability
- **Reset Functionality**: Complete data wipe when needed
- **Sample Data**: Optional sample data for new users

## 🚀 Deployment

### Development Build
```bash
# Create development build
npx expo install --fix
npx expo run:ios
npx expo run:android
```

### Production Build
```bash
# Build for production
npm run build:web
npx expo build:ios
npx expo build:android
```

### Web Deployment
```bash
# Build and deploy web version
npm run build:web
# Deploy to your preferred hosting service
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style
- Follow TypeScript best practices
- Use meaningful component and variable names
- Add comments for complex logic
- Maintain consistent formatting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo Team** - Amazing development platform
- **React Native Community** - Excellent libraries and tools
- **Lucide Icons** - Beautiful, consistent iconography
- **Pexels** - High-quality stock photography

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/yourusername/focusnest/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/focusnest/discussions)

---

**Built with ❤️ by the FocusNest Team**

*Master your day, one focused block at a time.* 🎯
