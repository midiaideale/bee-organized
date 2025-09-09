import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ArrowLeft, MoreHorizontal, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  position: number;
  column_id: string;
  assigned_to?: string;
  due_date?: string;
}

interface Column {
  id: string;
  title: string;
  position: number;
  project_id: string;
  tasks?: Task[];
}

interface Project {
  id: string;
  title: string;
  description?: string;
  color: string;
}

const defaultColumns = [
  { title: 'Projeto', position: 0 },
  { title: 'Status', position: 1 },
  { title: 'To Do', position: 2 },
  { title: 'Revisão', position: 3 },
  { title: 'Correção', position: 4 },
  { title: 'Aprovação', position: 5 },
];

export default function NewProjectBoard() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedColumnId, setSelectedColumnId] = useState<string>('');
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [showNewColumnDialog, setShowNewColumnDialog] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId, user]);

  const fetchProjectData = async () => {
    if (!user || !projectId) return;

    try {
      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Fetch columns with tasks
      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select(`
          id,
          title,
          position,
          project_id,
          tasks (
            id,
            title,
            description,
            priority,
            position,
            column_id,
            assigned_to,
            due_date
          )
        `)
        .eq('project_id', projectId)
        .order('position');

      if (columnsError) throw columnsError;

      // If no columns exist, create default ones
      if (!columnsData || columnsData.length === 0) {
        await createDefaultColumns(projectId);
        await fetchProjectData(); // Refetch after creating columns
        return;
      }

      setColumns(columnsData.map(col => ({
        ...col,
        tasks: (col.tasks || []).map((task: any) => ({
          ...task,
          priority: task.priority as 'low' | 'medium' | 'high',
        }))
      })));
    } catch (error: any) {
      toast({
        title: "Erro ao carregar projeto",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultColumns = async (projectId: string) => {
    if (!user) return;

    try {
      const columnsToInsert = defaultColumns.map(col => ({
        ...col,
        project_id: projectId,
      }));

      const { error } = await supabase
        .from('columns')
        .insert(columnsToInsert);

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Erro ao criar colunas padrão",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addTask = async (columnId: string) => {
    if (!newTaskTitle.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: newTaskTitle,
          description: newTaskDescription,
          priority: newTaskPriority,
          column_id: columnId,
          created_by: user.id,
          position: 0,
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setColumns(prev => prev.map(col => 
        col.id === columnId 
          ? { ...col, tasks: [{ 
              ...data, 
              priority: data.priority as 'low' | 'medium' | 'high' 
            }, ...(col.tasks || [])] }
          : col
      ));

      // Reset form
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPriority('medium');

      toast({
        title: "Tarefa criada com sucesso",
        description: `"${newTaskTitle}" foi adicionada à coluna`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar tarefa",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addColumn = async () => {
    if (!newColumnTitle.trim() || !user || !projectId) return;

    try {
      const { data, error } = await supabase
        .from('columns')
        .insert({
          title: newColumnTitle,
          project_id: projectId,
          position: columns.length,
        })
        .select()
        .single();

      if (error) throw error;

      setColumns(prev => [...prev, { ...data, tasks: [] }]);
      setNewColumnTitle('');
      setShowNewColumnDialog(false);

      toast({
        title: "Coluna criada com sucesso",
        description: `Coluna "${newColumnTitle}" foi adicionada`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar coluna",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteColumn = async (columnId: string) => {
    try {
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', columnId);

      if (error) throw error;

      setColumns(prev => prev.filter(col => col.id !== columnId));

      toast({
        title: "Coluna removida",
        description: "A coluna foi removida com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover coluna",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Projeto não encontrado</h2>
          <p className="text-muted-foreground mb-4">O projeto solicitado não existe ou você não tem acesso a ele.</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="pl-0"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
            {project.description && (
              <p className="text-muted-foreground">{project.description}</p>
            )}
          </div>
        </div>

        <Dialog open={showNewColumnDialog} onOpenChange={setShowNewColumnDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Coluna
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Coluna</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="column-title">Título da Coluna</Label>
                <Input
                  id="column-title"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="Digite o título da coluna..."
                />
              </div>
              <Button onClick={addColumn} className="w-full">
                Criar Coluna
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 min-h-[600px]">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col">
            <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-muted">
              <div>
                <h3 className="font-semibold text-foreground">{column.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {column.tasks?.length || 0} tarefa(s)
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem 
                    onClick={() => deleteColumn(column.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remover Coluna
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-3 flex-1">
              {column.tasks?.map((task) => (
                <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <h4 className="font-medium text-sm mb-2">{task.title}</h4>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add Task Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full h-20 border-2 border-dashed border-muted-foreground/25 hover:border-primary/50"
                    onClick={() => setSelectedColumnId(column.id)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Tarefa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Tarefa - {column.title}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="task-title">Título</Label>
                      <Input
                        id="task-title"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Digite o título da tarefa..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="task-description">Descrição</Label>
                      <Textarea
                        id="task-description"
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        placeholder="Descreva a tarefa..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="task-priority">Prioridade</Label>
                      <Select value={newTaskPriority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewTaskPriority(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={() => addTask(column.id)} className="w-full">
                      Criar Tarefa
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}