# LakshyaAI 🎯 - Your Ultimate AI Career Coach

![LakshyaAI Banner](https://via.placeholder.com/1200x400/000000/FFFFFF/?text=LakshyaAI+-+AI+Career+Coach)

LakshyaAI is an advanced, AI-driven career growth and interview preparation platform designed to help professionals and students achieve their career goals. By leveraging state-of-the-art AI, the platform provides personalized skill roadmaps, industry insights, and realistic mock interviews (both text-based and voice-based) to ensure users are fully prepared for the job market.

## ✨ Key Features

- **📊 Comprehensive Dashboard:** Track your progress, view your performance trends, XP, and streaks in one unified overview.
- **🎙️ Voice & Text Mock Interviews:** Practice with highly realistic AI interviews in either Multiple-Choice (MCQ) or interactive Voice-based formats.
- **📈 Industry Insights:** Stay ahead of the curve with real-time industry trends, salary range estimates, and top demanded skills.
- **🗺️ AI-Generated Skill Roadmaps:** Get a step-by-step personalized learning path based on your target role and current skill level.
- **🏆 Gamification & XP System:** Earn XP, build learning streaks, and level up as you complete assessments and interviews.
- **📝 Resume & Cover Letter Generation:** Automatically get tailored resumes and cover letters crafted by AI to match specific job descriptions.
- **🧠 Advanced Assessments:** Take dynamic quizzes and receive targeted, actionable feedback to improve your weak areas.

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Directory)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) hosted on [Neon](https://neon.tech/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** [Clerk](https://clerk.dev/)
- **AI Integration:** Google Generative AI / Groq / OpenAI integrations
- **Deployment:** [Vercel](https://vercel.com/)

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18+) and `npm` installed.

### 1. Clone the repository

```bash
git clone https://github.com/your-username/lakshyaai.git
cd lakshyaai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file in the root of your project and configure the necessary credentials:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret_key

# AI Providers
GOOGLE_GEMINI_API_KEY=your_key
# ... add other required environment variables
```

### 4. Run Prisma Migrations

Push the Prisma schema to your database to create all the necessary tables:

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application in action.

## 🗄️ Database Schema

The platform relies on a heavily relational schema including exactly the following domains:
- **User Models**: Authentication, Profile mapping, and Experience tracking.
- **Assessments & Roadmaps**: Step-by-step user plans and skill tracking matrices.
- **Interviews**: Detailed sessions tracking answers, time, categories, and AI-driven feedback (`InterviewSession`, `VoiceInterviewSession`, `InterviewAttempt`).
- **Insights**: Global cached knowledge graphs for distinct industry domains.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check the issues page if you want to contribute.

## 📄 License

This project is licensed under the MIT License.
