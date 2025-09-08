import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface CreateProjectDialogProps {
  onProjectCreated?: () => void;
  children?: React.ReactNode;
}

const CreateProjectDialog = ({ onProjectCreated, children }: CreateProjectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Project title is required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // Simulate project creation (replace with Supabase later)
    const newProject = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      color: "bg-gradient-honey",
      createdAt: new Date().toISOString(),
      tasks: { todo: 0, inProgress: 0, done: 0 },
      members: 1
    };

    // Save to localStorage temporarily
    const existingProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    existingProjects.push(newProject);
    localStorage.setItem("projects", JSON.stringify(existingProjects));

    toast({
      title: "Success!",
      description: "Project created successfully"
    });

    setOpen(false);
    setTitle("");
    setDescription("");
    setLoading(false);
    
    onProjectCreated?.();
    navigate(`/project/${newProject.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-gradient-honey text-primary-foreground shadow-soft transition-bounce hover:shadow-glow">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Name</label>
            <Input
              placeholder="Enter project name..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Brief description of your project..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <Button 
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-gradient-honey"
          >
            {loading ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;