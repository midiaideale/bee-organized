import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, ArrowLeft, MoreHorizontal } from "lucide-react";
import { Link, useParams } from "react-router-dom";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const ProjectBoard = () => {
  const { projectId } = useParams();
  const [columns, setColumns] = useState<Column[]>([
    { id: "todo", title: "To Do", tasks: [] },
    { id: "inprogress", title: "In Progress", tasks: [] },
    { id: "done", title: "Done", tasks: [] }
  ]);
  
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("");

  const addTask = (columnId: string) => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: newTaskDescription,
      priority: "medium"
    };
    
    setColumns(prev => prev.map(col => 
      col.id === columnId 
        ? { ...col, tasks: [...col.tasks, newTask] }
        : col
    ));
    
    setNewTaskTitle("");
    setNewTaskDescription("");
  };

  const moveTask = (taskId: string, fromColumn: string, toColumn: string) => {
    const task = columns.find(col => col.id === fromColumn)?.tasks.find(t => t.id === taskId);
    if (!task) return;

    setColumns(prev => prev.map(col => {
      if (col.id === fromColumn) {
        return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) };
      }
      if (col.id === toColumn) {
        return { ...col, tasks: [...col.tasks, task] };
      }
      return col;
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="px-6 py-6 border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="transition-smooth hover:bg-muted">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Project Board</h1>
                <p className="text-muted-foreground">Organize your tasks efficiently</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {columns.map((column) => (
              <div key={column.id} className="space-y-4">
                {/* Column Header */}
                <div className="flex items-center justify-between p-4 bg-card rounded-lg shadow-soft">
                  <h3 className="font-semibold text-lg">{column.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                      {column.tasks.length}
                    </span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedColumn(column.id)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Task to {column.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            placeholder="Task title"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                          />
                          <Textarea
                            placeholder="Task description"
                            value={newTaskDescription}
                            onChange={(e) => setNewTaskDescription(e.target.value)}
                          />
                          <Button 
                            onClick={() => addTask(column.id)}
                            className="w-full bg-gradient-honey"
                          >
                            Add Task
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Tasks */}
                <div className="space-y-3 min-h-[500px]">
                  {column.tasks.map((task) => (
                    <Card 
                      key={task.id} 
                      className="shadow-soft transition-smooth hover:shadow-card cursor-move group"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("taskId", task.id);
                        e.dataTransfer.setData("fromColumn", column.id);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <h4 className="font-medium group-hover:text-primary transition-smooth">
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-sm text-muted-foreground">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded ${
                                task.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                                task.priority === 'medium' ? 'bg-secondary text-secondary-foreground' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-smooth">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Drop Zone */}
                <div 
                  className="h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground opacity-0 transition-smooth group-hover:opacity-100"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const taskId = e.dataTransfer.getData("taskId");
                    const fromColumn = e.dataTransfer.getData("fromColumn");
                    moveTask(taskId, fromColumn, column.id);
                  }}
                >
                  Drop task here
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectBoard;