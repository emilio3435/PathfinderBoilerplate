import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ExternalLink, 
  Github, 
  FolderOpen,
  Calendar,
  Code
} from "lucide-react";

interface ProjectShowcaseProps {
  projects: any[];
}

export default function ProjectShowcase({ projects }: ProjectShowcaseProps) {
  
  if (!projects || projects.length === 0) {
    return (
      <Card className="bg-white rounded-xl shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-charcoal mb-6">Portfolio Projects</h2>
          <div className="text-center py-8 text-gray-500">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No projects yet. Complete lessons to build your first project!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-xl shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-charcoal mb-6">Portfolio Projects</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4">
                {/* Project Image Placeholder */}
                <div className="w-full h-32 bg-gradient-to-br from-sage-light to-sage rounded-lg mb-4 flex items-center justify-center">
                  <Code className="h-8 w-8 text-sage-dark" />
                </div>
                
                <h3 className="font-semibold text-charcoal mb-2" data-testid={`project-title-${project.id}`}>
                  {project.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3" data-testid={`project-description-${project.id}`}>
                  {project.description}
                </p>
                
                {/* Technology Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.technologies && project.technologies.map((tech: string, index: number) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-xs"
                      data-testid={`project-tech-${project.id}-${index}`}
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>

                {/* Project Meta */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span data-testid={`project-date-${project.id}`}>
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {project.isCompleted && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Completed
                    </Badge>
                  )}
                </div>
                
                {/* Project Links */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {project.liveUrl && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-gray-500 hover:text-sage p-1"
                        data-testid={`button-live-${project.id}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    {project.githubUrl && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-gray-500 hover:text-sage p-1"
                        data-testid={`button-github-${project.id}`}
                      >
                        <Github className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-sage hover:text-sage-dark font-medium"
                    data-testid={`button-view-${project.id}`}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
