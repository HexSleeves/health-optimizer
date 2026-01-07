# Health Optimizer

A comprehensive iOS health optimization application that intakes user health conditions and generates personalized diet, exercise, supplementation, and lifestyle recommendations with a profile-optimized LLM assistant.

## Features

- 🦠 **Health Profile Management** - Track conditions, medications, allergies, and goals
- 🍽️ **Personalized Diet Plans** - Nutrition guidance based on your health profile
- 🏋️ **Exercise Programs** - Workouts adapted to your fitness level and conditions
- 💊 **Supplement Recommendations** - Evidence-based supplementation with interaction checking
- 🌙 **Lifestyle Optimization** - Sleep, stress, and daily habit recommendations
- 🤖 **AI Health Assistant** - Context-aware chat with your health profile
- ❤️ **Apple HealthKit Integration** - Sync activity, sleep, heart rate, and more
- 🔒 **Privacy-First Design** - Health data stays local unless explicitly synced

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS)
- **State Management**: Zustand with persistence
- **Backend**: Convex (serverless database)
- **AI Providers**: OpenAI, Google Gemini, Local models
- **Health Data**: Apple HealthKit
- **Authentication**: Apple Sign-In

## Project Structure

```
health-optimizer/
├── app/                    # Expo Router screens
│   ├── (tabs)/             # Main tab navigation
│   ├── (auth)/             # Authentication screens
│   └── intake/             # Health intake wizard
├── components/             # Reusable components
│   ├── ui/                 # Base UI components
│   ├── health/             # Health-specific components
│   ├── assistant/          # Chat components
│   └── settings/           # Settings components
├── services/               # Business logic
│   ├── llm/                # LLM provider abstraction
│   ├── healthkit/          # HealthKit integration
│   └── recommendations/    # Recommendation engines
├── stores/                 # Zustand state stores
├── convex/                 # Convex backend
├── types/                  # TypeScript definitions
├── hooks/                  # Custom React hooks
└── utils/                  # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- iOS Simulator or physical device (for HealthKit)
- Expo Go app (for development)

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd health-optimizer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. Start the development server:
```bash
npm start
```

### Environment Variables

```env
# Convex Backend
CONVEX_URL=https://your-deployment.convex.cloud

# LLM Providers
LLM_DEFAULT_PROVIDER=openai
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...

# Features
ENABLE_HEALTHKIT=true
ENABLE_OFFLINE_MODE=true
```

## LLM Provider Configuration

The app supports multiple LLM providers with automatic fallback:

1. **OpenAI** (default) - GPT-4o, GPT-3.5-turbo
2. **Google Gemini** - Gemini Pro models
3. **Local Models** - On-device inference (iOS only)

Configure providers in Settings > AI Provider.

## HealthKit Integration

The app reads the following data types from Apple HealthKit:

- Steps and distance
- Active and basal energy
- Heart rate, HRV, resting HR
- Sleep analysis
- Workouts
- Body measurements

Data stays on-device by default. Cloud sync is opt-in.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system architecture, data models, and design decisions.

## MVP Roadmap

### Phase 1: Foundation ✅
- Project setup with Expo, Tailwind, Convex
- Basic navigation and UI components
- User profile and health intake flow
- HealthKit permission and basic sync

### Phase 2: Core Features (In Progress)
- Diet recommendation engine
- Exercise recommendation engine
- Supplement guidance with interaction checking
- LLM assistant with OpenAI

### Phase 3: Enhancement
- Gemini provider integration
- Local model setup
- Recipe database integration
- Progress tracking and analytics

### Phase 4: Polish
- UI/UX refinement
- Performance optimization
- App Store preparation

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT License - see LICENSE file for details.

## Disclaimer

This app is not a substitute for professional medical advice. Always consult healthcare providers for medical decisions.
