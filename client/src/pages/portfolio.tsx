import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/contexts/AppContext";
import { 
  Trophy, 
  Star, 
  Flame, 
  ExternalLink, 
  Github,
  Calendar,
  Target
} from "lucide-react";

import ProgressOverview from "@/components/portfolio/progress-overview";
import ProjectShowcase from "@/components/portfolio/project-showcase";

export default function PortfolioPage() {
  const { user } = useApp();

  // Fetch user data
  const { data: learningPaths } = useQuery({
    queryKey: ["/api/learning-paths/user", user?.id],
    enabled: !!user?.id,
  });

  const { data: projects } = useQuery({
    queryKey: ["/api/projects/user", user?.id],
    enabled: !!user?.id,
  });

  const { data: achievements } = useQuery({
    queryKey: ["/api/achievements/user", user?.id],
    enabled: !!user?.id,
  });

  const { data: skills } = useQuery({
    queryKey: ["/api/skills/user", user?.id],
    enabled: !!user?.id,
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-charcoal mb-2">Please Log In</h2>
            <p className="text-gray-600">You need to be logged in to view your portfolio.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Portfolio Header */}
        <Card className="bg-white rounded-2xl shadow-sm mb-8">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-sage to-sage-dark rounded-2xl flex items-center justify-center">
                  <span className="text-white text-2xl font-bold" data-testid="text-user-initials">
                    {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-charcoal" data-testid="text-user-name">
                    {user.name || 'Anonymous Learner'}
                  </h1>
                  <p className="text-gray-600" data-testid="text-user-title">
                    Lifelong Learner
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-sage" data-testid="text-total-points">
                  {user.totalPoints?.toLocaleString() || '0'}
                </div>
                <p className="text-gray-600">Total Points</p>
              </div>
            </div>

            <ProgressOverview 
              learningPaths={learningPaths || []}
              projects={projects || []}
              achievements={achievements || []}
              user={user}
            />
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Active Learning Paths */}
            <Card className="bg-white rounded-xl shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-charcoal mb-6">Active Learning Paths</h2>
                <div className="space-y-4">
                  {learningPaths && learningPaths.length > 0 ? (
                    learningPaths.filter((path: any) => path.isActive).map((path: any) => (
                      <div key={path.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Target className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-charcoal" data-testid={`text-path-title-${path.id}`}>
                                {path.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Started {new Date(path.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className="text-sage font-medium" data-testid={`text-path-progress-${path.id}`}>
                            {path.progress || 0}% Complete
                          </span>
                        </div>
                        <Progress value={path.progress || 0} className="mb-3" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            Difficulty: {path.difficulty}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-sage hover:text-sage-dark font-medium"
                            data-testid={`button-continue-${path.id}`}
                          >
                            Continue →
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No active learning paths yet. Start your journey from the homepage!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Project Showcase */}
            <ProjectShowcase projects={projects || []} />

            {/* Skills Assessment */}
            <Card className="bg-white rounded-xl shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-charcoal mb-6">Skill Progression</h2>
                <div className="space-y-4">
                  {skills && skills.length > 0 ? (
                    skills.map((skill: any) => (
                      <div key={skill.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 text-xs font-bold">
                              {skill.name.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium text-charcoal" data-testid={`text-skill-${skill.id}`}>
                            {skill.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-sage h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${skill.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-sage min-w-16" data-testid={`text-skill-level-${skill.id}`}>
                            {skill.level}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Skills will appear as you progress through your learning paths.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Achievements */}
            <Card className="bg-white rounded-xl shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-charcoal mb-4">Recent Achievements</h3>
                <div className="space-y-4">
                  {achievements && achievements.length > 0 ? (
                    achievements.slice(0, 3).map((achievement: any) => (
                      <div key={achievement.id} className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-golden to-yellow-500 rounded-lg flex items-center justify-center">
                          <Trophy className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-charcoal" data-testid={`text-achievement-${achievement.id}`}>
                            {achievement.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Achievements coming soon!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Learning Streak */}
            <Card className="bg-gradient-to-br from-sage to-sage-dark rounded-xl text-white">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Flame className="h-6 w-6 text-golden" />
                  <div>
                    <h3 className="text-lg font-bold">Learning Streak</h3>
                    <p className="text-sage-light">Keep it going!</p>
                  </div>
                </div>
                <div className="text-3xl font-bold mb-2" data-testid="text-streak-days">
                  {user.streakDays || 0} Days
                </div>
                <p className="text-sage-light text-sm mb-4">
                  Your current streak
                </p>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 7 }, (_, i) => (
                    <div 
                      key={i}
                      className={`w-6 h-6 rounded ${
                        i < (user.streakDays || 0) % 7 ? 'bg-golden' : 'bg-sage-light opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Goals */}
            <Card className="bg-white rounded-xl shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-charcoal mb-4">Upcoming Goals</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 border-2 border-sage rounded" />
                    <span className="text-gray-700">Complete current module</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 border-2 border-sage rounded" />
                    <span className="text-gray-700">Build first project</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 border-2 border-sage rounded" />
                    <span className="text-gray-700">Earn next achievement</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
