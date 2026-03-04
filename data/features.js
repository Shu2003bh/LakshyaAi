import { Brain, Briefcase, BarChart3, FileText } from "lucide-react";

export const features = [
  {
    title: "AI-Powered Career Guidance",
    description: "Get personalized career advice and insights powered by advanced AI technology.",
    icon: <Brain className="h-10 w-10 text-primary mb-4" />,
    link: "/career-test"
  },
  {
    title: "Interview Preparation",
    description: "Practice with role-specific questions and get instant feedback to improve your performance.",
    icon: <Briefcase className="h-10 w-10 text-primary mb-4" />,
    link: "/interview"
  },
  {
    title: "Industry Insights",
    description: "Stay ahead with real-time industry trends, salary data, and market analysis.",
    icon: <BarChart3 className="h-10 w-10 text-primary mb-4" />,
    link: "/dashboard"
  },
  {
    title: "Smart Resume Creation",
    description: "Generate ATS-optimized resumes with AI assistance.",
    icon: <FileText className="h-10 w-10 text-primary mb-4" />,
    link: "/resume"
  }
];