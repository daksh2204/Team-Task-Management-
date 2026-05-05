import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';

const TaskColumn = ({ id, title, tasks, onEdit }) => {
  const { setNodeRef } = useDroppable({
    id: id, // Column ID directly corresponds to status
  });

  return (
    <div className="flex flex-col w-80 shrink-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-semibold text-gray-700 uppercase text-sm tracking-wider">{title}</h3>
        <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      <div 
        ref={setNodeRef}
        className="flex-1 bg-gray-100 rounded-xl p-3 min-h-[500px] flex flex-col gap-3 shadow-inner"
      >
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} onEdit={onEdit} />
        ))}
      </div>
    </div>
  );
};

export default TaskColumn;
