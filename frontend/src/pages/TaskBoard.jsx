import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskColumn from '../components/TaskColumn';
import TaskModal from '../components/TaskModal';
import { Plus } from 'lucide-react';

const COLUMNS = ['To Do', 'In Progress', 'Done'];

const TaskBoard = () => {
  const { id } = useParams(); // project id
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get(`/api/tasks?projectId=${id}`);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [id]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id; // Task ID
    const overId = over.id; // Column ID or Task ID

    const activeTask = tasks.find((t) => t._id === activeId);
    if (!activeTask) return;

    // Check if user is allowed to move it
    if (user.role === 'Member' && activeTask.assignedTo?._id !== user._id) {
      alert("You can only move tasks assigned to you.");
      return;
    }

    // Determine the destination status
    let newStatus = overId;
    if (!COLUMNS.includes(overId)) {
      // Over another task
      const overTask = tasks.find(t => t._id === overId);
      if (overTask) newStatus = overTask.status;
    }

    if (!COLUMNS.includes(newStatus)) return;
    if (activeTask.status === newStatus) return; // No change

    // Optimistic Update
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t._id === activeId ? { ...t, status: newStatus } : t))
    );

    try {
      await api.put(`/api/tasks/${activeId}`, { status: newStatus });
    } catch (error) {
      console.error('Error updating task status', error);
      // Revert on error
      fetchTasks();
    }
  };

  const openCreateModal = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  if (loading) return <div className="flex justify-center mt-10">Loading Board...</div>;

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
        {user?.role === 'Admin' && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </button>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="flex-1 flex space-x-6 overflow-x-auto pb-4">
          {COLUMNS.map((colStatus) => {
            const columnTasks = tasks.filter((t) => t.status === colStatus);
            return (
              <SortableContext key={colStatus} items={columnTasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
                <TaskColumn 
                  id={colStatus} 
                  title={colStatus} 
                  tasks={columnTasks} 
                  onEdit={(task) => openEditModal(task)} 
                />
              </SortableContext>
            );
          })}
        </div>
      </DndContext>

      {isModalOpen && (
        <TaskModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          task={selectedTask}
          projectId={id}
          refreshTasks={fetchTasks}
        />
      )}
    </div>
  );
};

export default TaskBoard;
