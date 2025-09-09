import { Button } from "@/components/ui/button";
import { ArrowRight, Hexagon } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import heroImage from "@/assets/bee-hero.jpg";

const Welcome = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-soft">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="px-6 py-4">
        <nav className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <Hexagon className="w-8 h-8 text-primary" fill="currentColor" />
            <span className="text-xl font-semibold">BeeOrganized</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" className="transition-smooth hover:bg-muted">
                Entrar
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-honey text-primary-foreground shadow-soft transition-smooth hover:shadow-glow">
                Começar
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-gentle-bounce">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Organize your
                  <span className="text-transparent bg-gradient-honey bg-clip-text"> projects </span>
                  like a bee
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  Beautiful, minimalist Kanban boards that help you stay focused 
                  and productive. No clutter, just pure organization.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button 
                    size="lg" 
                    className="bg-gradient-honey text-primary-foreground shadow-card transition-bounce hover:shadow-glow hover:scale-105 w-full sm:w-auto"
                  >
                    Começar a Organizar
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 transition-smooth hover:bg-muted hover:scale-105"
                >
                  See Demo
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-soft">
                    <Hexagon className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">Simple</h3>
                  <p className="text-sm text-muted-foreground">Clean, intuitive interface</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-soft">
                    <Hexagon className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">Fluid</h3>
                  <p className="text-sm text-muted-foreground">Smooth drag & drop</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-soft">
                    <Hexagon className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">Focused</h3>
                  <p className="text-sm text-muted-foreground">No distractions</p>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative animate-float">
              <img 
                src={heroImage}
                alt="BeeOrganized - Beautiful project organization"
                className="w-full rounded-3xl shadow-card"
              />
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-honey rounded-2xl shadow-glow opacity-80 animate-float" 
                   style={{ animationDelay: '1s' }}></div>
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-accent rounded-xl shadow-soft opacity-70 animate-float" 
                   style={{ animationDelay: '2s' }}></div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 mt-20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground">
            Made with 💛 for productive teams everywhere
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;