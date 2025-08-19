import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import { AppContext, User } from "@/contexts/AppContext";

import LandingPage from "@/pages/landing";
import LearningPage from "@/pages/learning";
import PortfolioPage from "@/pages/portfolio";
import CourseOverview from "@/pages/course-overview";
import OnboardingWizard from "@/components/onboarding/onboarding-wizard";
import { Navigation } from "@/components/common/navigation";
import NotFound from "@/pages/not-found";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPath, setCurrentPath] = useState<any>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContext.Provider value={{ user, setUser, currentPath, setCurrentPath }}>
          <div className="min-h-screen bg-gray-50">
            {user && <Navigation />}
            <Toaster />
            <Switch>
              <Route path="/" component={LandingPage} />
              <Route path="/onboarding" component={OnboardingWizard} />
              <Route path="/course-overview/:pathId" component={CourseOverview} />
              <Route path="/learning/:pathId?" component={LearningPage} />
              <Route path="/portfolio" component={PortfolioPage} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </AppContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
