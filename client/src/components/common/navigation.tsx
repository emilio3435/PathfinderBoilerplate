import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  User, 
  Trophy,
  Compass,
  Menu,
  X 
} from "lucide-react";
import { useState } from "react";

export function Navigation() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/learning", label: "Learning", icon: BookOpen },
    { href: "/portfolio", label: "Portfolio", icon: Trophy },
  ];

  const isActive = (path: string) => location.startsWith(path);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50" data-testid="navigation-bar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3" data-testid="link-home">
            <div className="w-8 h-8 bg-sage rounded-lg flex items-center justify-center">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-charcoal">Sage</h1>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-sage text-white"
                      : "text-gray-600 hover:text-sage hover:bg-sage/10"
                  }`}
                  data-testid={`link-${item.label.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Profile */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" size="sm" data-testid="button-profile">
              <User className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden" data-testid="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-sage text-white"
                        : "text-gray-600 hover:text-sage hover:bg-sage/10"
                    }`}
                    data-testid={`mobile-link-${item.label.toLowerCase()}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}