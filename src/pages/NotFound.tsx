import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Hexagon } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-soft">
      <div className="text-center space-y-8 max-w-md mx-auto px-6">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-gradient-honey rounded-3xl flex items-center justify-center mx-auto shadow-glow animate-gentle-bounce">
            <Hexagon className="w-10 h-10 text-primary-foreground" fill="currentColor" />
          </div>
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Page not found</h2>
            <p className="text-muted-foreground">
              Looks like this page flew away! Let's get you back to organizing.
            </p>
          </div>
        </div>
        
        <Link to="/">
          <Button 
            size="lg"
            className="bg-gradient-honey text-primary-foreground shadow-soft transition-bounce hover:shadow-glow hover:scale-105"
          >
            <Home className="w-5 h-5 mr-2" />
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
