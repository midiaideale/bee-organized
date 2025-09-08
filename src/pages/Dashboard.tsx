import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Hexagon, Users, Calendar, MoreHorizontal, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import CreateProjectDialog from "@/components/CreateProjectDialog";

// Mock project data
const projects = [
  {
    id: 1,
    title: "Website Redesign",
    description: "Complete overhaul of company website with modern design",
    color: "bg-gradient-honey",
    tasks: { todo: 8, inProgress: 3, done: 12 },
    members: 4,
    dueDate: "Dec 15"
  },
  {
    id: 2,
    title: "Mobile App",
    description: "iOS and Android app development",
    color: "bg-gradient-accent",
    tasks: { todo: 15, inProgress: 6, done: 8 },
    members: 6,
    dueDate: "Jan 30"
  },
  {
    id: 3,
    title: "Brand Guidelines",
    description: "Create comprehensive brand identity guide",
    color: "bg-secondary",
    tasks: { todo: 5, inProgress: 2, done: 7 },
    members: 2,
    dueDate: "Nov 28"
  }
];

const Dashboard = () => {
  const [userProjects, setUserProjects] = useState([]);
  
  useEffect(() => {
    // Load projects from localStorage
    const savedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    setUserProjects(savedProjects);
  }, []);
  
  const refreshProjects = () => {
    const savedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    setUserProjects(savedProjects);
  };
  
  const allProjects = [...projects, ...userProjects];
  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="px-6 py-6 border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="transition-smooth hover:bg-muted">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Hexagon className="w-8 h-8 text-primary" fill="currentColor" />
                <div>
                  <h1 className="text-2xl font-bold">Your Projects</h1>
                  <p className="text-muted-foreground">Organize your work beautifully</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="transition-smooth hover:bg-muted">
                <Users className="w-4 h-4 mr-2" />
                Invite Team
              </Button>
              <CreateProjectDialog onProjectCreated={refreshProjects} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-soft transition-smooth hover:shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Active Projects</p>
                    <p className="text-3xl font-bold text-primary">{allProjects.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-honey rounded-2xl flex items-center justify-center">
                    <Hexagon className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft transition-smooth hover:shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Tasks</p>
                    <p className="text-3xl font-bold text-primary">67</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-accent rounded-2xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-accent-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft transition-smooth hover:shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Completed</p>
                    <p className="text-3xl font-bold text-primary">27</p>
                  </div>
                  <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-secondary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projects Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Projects</h2>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                View All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allProjects.map((project) => (
                <Link key={project.id} to={`/project/${project.id}`}>
                <Card 
                  className="shadow-card transition-bounce hover:shadow-glow hover:scale-[1.02] cursor-pointer group animate-gentle-bounce"
                  style={{ animationDelay: `${project.id * 0.1}s` }}
                >
                  <CardContent className="p-6 space-y-4">
                    {/* Project Header */}
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 ${project.color} rounded-2xl flex items-center justify-center shadow-soft group-hover:shadow-glow transition-smooth`}>
                        <Hexagon className="w-6 h-6 text-white" fill="currentColor" />
                      </div>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-smooth">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Project Info */}
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-smooth">
                        {project.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {project.description}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {Math.round((project.tasks.done / (project.tasks.todo + project.tasks.inProgress + project.tasks.done)) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-honey transition-smooth"
                          style={{ 
                            width: `${(project.tasks.done / (project.tasks.todo + project.tasks.inProgress + project.tasks.done)) * 100}%` 
                          }}
                        />
                      </div>
                    </div>

                    {/* Project Stats */}
                    <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{project.members}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{project.dueDate}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">
                          {project.tasks.todo + project.tasks.inProgress + project.tasks.done} tasks
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </Link>
              ))}

              {/* Add New Project Card */}
              <CreateProjectDialog onProjectCreated={refreshProjects}>
                <Card className="shadow-soft transition-bounce hover:shadow-card hover:scale-[1.02] cursor-pointer border-2 border-dashed border-border group">
                  <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[280px] text-center space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center group-hover:bg-gradient-honey group-hover:shadow-soft transition-smooth">
                      <Plus className="w-8 h-8 text-muted-foreground group-hover:text-white transition-smooth" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold group-hover:text-primary transition-smooth">
                        Create New Project
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Start organizing your next big idea
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CreateProjectDialog>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;