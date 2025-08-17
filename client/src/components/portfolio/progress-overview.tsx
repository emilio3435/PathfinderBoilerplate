import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Award, 
  FolderOpen, 
  Calendar,
  TrendingUp
} from "lucide-react";

interface ProgressOverviewProps {
  learningPaths: any[];
  projects: any[];
  achievements: any[];
  user: any;
}

export default function ProgressOverview({
  learningPaths,
  projects,
  achievements,
  user
}: ProgressOverviewProps) {
  
  const completedPaths = learningPaths.filter(path => path.progress >= 100).length;
  const completedProjects = projects.filter(project => project.isCompleted).length;
  const totalAchievements = achievements.length;

  const stats = [
    {
      icon: BookOpen,
      label: "Courses Completed",
      value: completedPaths,
      total: learningPaths.length,
      color: "blue"
    },
    {
      icon: Award,
      label: "Certifications",
      value: totalAchievements,
      color: "purple"
    },
    {
      icon: FolderOpen,
      label: "Projects Built",
      value: completedProjects,
      total: projects.length,
      color: "green"
    },
    {
      icon: Calendar,
      label: "Day Streak",
      value: user.streakDays || 0,
      color: "orange"
    }
  ];

  return (
    <div className="grid md:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="text-center">
            <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center mx-auto mb-3`}>
              <Icon className={`h-6 w-6 text-${stat.color}-600`} />
            </div>
            <div className="text-2xl font-bold text-charcoal mb-1" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
              {stat.value}
              {stat.total && ` / ${stat.total}`}
            </div>
            <p className="text-gray-600 text-sm">{stat.label}</p>
            {stat.total && stat.value < stat.total && (
              <Progress 
                value={(stat.value / stat.total) * 100} 
                className="mt-2 h-1"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
