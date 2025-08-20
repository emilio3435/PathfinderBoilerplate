# 🧠 Sage - Adaptive AI Learning Platform

<div align="center">

![Sage Learning Platform](https://img.shields.io/badge/AI-Powered-blue?style=for-the-badge&logo=openai)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

**Master Excel in 4 weeks with AI that adapts to your learning style in real-time**

Currently focused on Excel proficiency training with interactive lessons, practical exercises, and adaptive difficulty.

[🚀 Try the Demo](http://localhost:5000/api/demo) • [📊 Excel Learning Path](http://localhost:5000) • [🐛 Report Issues](https://github.com/your-username/sage-learning-platform/issues)

</div>

---

## 🌟 Excel Mastery in 4 Weeks

Sage specializes in **Excel proficiency training** with AI that adapts to your learning style. Instead of generic tutorials, you get personalized learning paths with practical business scenarios, real-time feedback, and hands-on practice that builds job-ready skills.

### ✨ Why Choose Sage for Excel

- **📊 Interactive Excel Challenges**: Practice with real formulas, data sets, and business scenarios
- **🎯 4-Week Structured Program**: From basics to advanced techniques with clear milestones
- **💼 Business-Ready Skills**: Learn with actual corporate data scenarios and use cases
- **🤖 AI Excel Tutor**: Get instant help with formulas, explanations, and troubleshooting
- **📈 Progress Tracking**: Visual progress through Excel skill levels with completion badges

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- OpenAI API Key
- Modern web browser

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/your-username/sage-learning-platform.git
cd sage-learning-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your OpenAI API key to .env

# Start the development server
npm run dev
```

Visit `http://localhost:5000` and begin your personalized learning journey!

---

## 🧠 How Sage Adapts to You

### The Learning Analysis Process

1. **📝 Chat Interaction**: You ask questions and engage with lessons
2. **🔍 Pattern Recognition**: Every 5 messages, Sage analyzes your:
   - Question complexity and depth
   - Confusion signals and help-seeking patterns  
   - Engagement levels and learning velocity
   - Concept mastery indicators
3. **⚡ Real-time Adaptation**: Sage automatically adjusts:
   - Teaching persona (supportive ↔ challenging)
   - Content difficulty and explanations
   - Personalized recommendations
   - Interactive suggestions

### Learning Difficulty Levels

| Level | Description | AI Behavior |
|-------|-------------|-------------|
| 🟢 **Mastery** | Deep understanding, seeks advanced concepts | Provides challenging material, explores edge cases |
| 🔵 **Advanced** | Grasps concepts quickly, ready for complexity | Offers accelerated pace, advanced examples |
| 🟡 **Comfortable** | Learning steadily, good comprehension | Maintains current pace, balanced support |
| 🔴 **Struggling** | Needs extra support and clarification | Simplifies explanations, provides more examples |

---

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18** with TypeScript for type-safe development
- **Tailwind CSS** + **shadcn/ui** for beautiful, accessible components
- **TanStack Query** for efficient server state management
- **Wouter** for lightweight routing

### Backend Stack  
- **Express.js** with TypeScript for robust API development
- **OpenAI GPT-4o** integration for intelligent content generation
- **Drizzle ORM** with PostgreSQL for type-safe database operations
- **Advanced caching** and **session management**

### Key Features

```typescript
// Adaptive difficulty analysis
interface DifficultyAnalysis {
  currentLevel: "struggling" | "comfortable" | "advanced" | "mastery";
  confidence: number;
  recommendations: {
    adjustDifficulty: string;
    recommendedActions: string[];
    nextLessonModifications: string[];
  };
}
```

---

## 📊 Smart Analytics Dashboard

Sage provides comprehensive insights into your learning journey:

- **📈 Progress Tracking**: Visual representation of your learning velocity
- **🎯 Comprehension Levels**: Real-time difficulty assessment with confidence scores
- **💡 Personalized Recommendations**: AI-generated suggestions for optimal learning
- **🏆 Achievement System**: Milestone tracking and skill development metrics
- **📋 Learning Path Optimization**: Dynamic curriculum adjustment based on performance

---

## 🎨 User Experience Highlights

### Enhanced Onboarding
- **4-step wizard** collecting detailed learning preferences
- **Skill level assessment** with personalized baseline setting
- **Learning style inference** through behavioral analysis during first modules
- **Goal setting** with specific outcomes and timelines
- **Industry context** for relevant, practical applications

### Interactive Learning
- **Contextual chat suggestions** based on current lesson
- **Real-time difficulty insights** with visual feedback
- **Adaptive content recommendations** for optimal pacing
- **Smart hint system** that provides help without giving away answers

---

## 🔧 Development & Customization

### Project Structure
```
sage/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route-based page components  
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and API client
├── server/              # Express.js backend
│   ├── services/        # Business logic and AI integration
│   ├── routes.ts        # API endpoint definitions
│   └── storage.ts       # Data access layer
├── shared/              # Shared types and schemas
└── README.md           # You are here!
```

### Key Configuration Files
- `vite.config.ts` - Frontend build configuration
- `tsconfig.json` - TypeScript compiler options
- `tailwind.config.ts` - Styling and theme configuration
- `drizzle.config.ts` - Database schema and migrations

---

## 🚀 Deployment

### Replit Deployment (Recommended)
1. Fork this repository to your Replit account
2. Set up your OpenAI API key in the Secrets tab
3. Click "Deploy" to make your app live instantly

### Alternative Deployment Options
- **Vercel**: Automatic deployment with GitHub integration
- **Railway**: Full-stack deployment with database included  
- **Docker**: Containerized deployment for any cloud provider

---

## 🛣️ Roadmap

### 🎯 Phase 1: Excel Mastery Platform (Current - December 2024)
- ✅ Interactive lesson system with quizzes and coding challenges
- ✅ Real-time progress tracking
- ✅ Rich content generation (concepts, examples, exercises)
- ✅ Excel-focused curriculum framework
- 🚧 Adaptive difficulty analysis (in progress)
- 🚧 Excel formula practice system (in progress)

### 🚀 Phase 2: Excel Mastery Features (Next)
- [ ] Complete Excel curriculum (Basic → Advanced → Expert)
- [ ] Real-world business scenarios and datasets
- [ ] Formula builder with instant feedback
- [ ] Progress persistence and user profiles
- [ ] Excel skill assessments and certifications

### 🌟 Phase 3: Community & Scale  
- [ ] Multi-modal learning (video, audio, interactive)
- [ ] Collaborative learning features
- [ ] Advanced AI tutoring with voice interaction
- [ ] Integration APIs for external platforms
- [ ] White-label solutions for educational institutions

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help makes Sage better for everyone.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with descriptive messages: `git commit -m 'feat: add amazing feature'`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a pull request with a detailed description

### Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Ensure accessibility compliance
- Maintain consistent code style

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenAI** for providing the powerful GPT-4o API that makes intelligent tutoring possible
- **Replit** for offering an exceptional development and deployment platform
- **shadcn/ui** for beautiful, accessible React components
- **The open-source community** for the amazing tools and libraries that make this possible

---

<div align="center">

**Built with ❤️ for learners everywhere**

[⭐ Star this repo](your-repo-url) if Sage is helping you learn better!

</div>