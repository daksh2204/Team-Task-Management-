import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, UserCircle } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../store/authStore';

const TaskCard = ({ task, onEdit }) => {
  const { user } = useAuthStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    Low: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    High: 'bg-red-100 text-red-800'
  };

  const isAssignedToMe = task.assignedTo?._id === user._id;
  const canEdit = user.role === 'Admin' || isAssignedToMe;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={clsx(
        "bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab hover:shadow-md transition-shadow relative group",
        isDragging && "opacity-50 shadow-2xl cursor-grabbing scale-105"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <span className={clsx("px-2 py-1 rounded text-xs font-medium", priorityColors[task.priority])}>
          {task.priority}
        </span>
        {canEdit && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
            onPointerDown={(e) => e.stopPropagation()} // Prevent drag start when clicking Edit
          >
            Edit
          </button>
        )}
      </div>
      
      <h4 className="text-sm font-semibold text-gray-900 mb-1">{task.title}</h4>
      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.description}</p>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center">
          <Calendar className="w-3.5 h-3.5 mr-1" />
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
        </div>
        <div className="flex items-center" title={task.assignedTo?.name || 'Unassigned'}>
          <UserCircle className="w-4 h-4 mr-1" />
          <span className="truncate max-w-[80px]">{task.assignedTo?.name || 'Unassigned'}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
