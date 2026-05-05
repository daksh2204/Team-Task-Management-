import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/axios';

const TaskModal = ({ isOpen, onClose, task, projectId, refreshTasks }) => {
  const { user } = useAuthStore();
  const isEdit = !!task;
  const canEditEverything = user.role === 'Admin';

  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'Medium',
    status: task?.status || 'To Do',
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    assignedTo: task?.assignedTo?._id || '',
  });

  const [members, setMembers] = useState([]);

  useEffect(() => {
    // Fetch project to get members list for assignment
    const fetchProject = async () => {
      try {
        const { data } = await api.get('/api/projects');
        const currentProj = data.find(p => p._id === projectId);
        if (currentProj) {
          setMembers(currentProj.members || []);
        }
      } catch (error) {
        console.error('Error fetching project members for task modal', error);
      }
    };
    if (canEditEverything) fetchProject();
  }, [projectId, canEditEverything]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, project: projectId };
      if (isEdit) {
        await api.put(`/api/tasks/${task._id}`, payload);
      } else {
        await api.post('/api/tasks', payload);
      }
      refreshTasks();
      onClose();
    } catch (error) {
      console.error('Error saving task', error);
      alert(error.response?.data?.message || 'Failed to save task');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/api/tasks/${task._id}`);
      refreshTasks();
      onClose();
    } catch (error) {
      console.error('Error deleting task', error);
      alert('Failed to delete task');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-900 mb-6">{isEdit ? 'Edit Task' : 'Create Task'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text" required name="title"
              value={formData.title} onChange={handleChange} disabled={!canEditEverything && isEdit}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description" rows={3}
              value={formData.description} onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Task details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                name="status" value={formData.status} onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                name="priority" value={formData.priority} onChange={handleChange} disabled={!canEditEverything && isEdit}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white disabled:bg-gray-100"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="date" name="dueDate"
                value={formData.dueDate} onChange={handleChange} disabled={!canEditEverything && isEdit}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Assignee</label>
              <select
                name="assignedTo" value={formData.assignedTo} onChange={handleChange} disabled={!canEditEverything && isEdit}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white disabled:bg-gray-100"
              >
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-between items-center pt-4 border-t border-gray-200">
            {isEdit && canEditEverything ? (
              <button
                type="button" onClick={handleDelete}
                className="text-red-600 hover:text-red-800 text-sm font-medium px-4 py-2 hover:bg-red-50 rounded-md transition-colors"
              >
                Delete Task
              </button>
            ) : <div />}
            <div className="flex space-x-3">
              <button
                type="button" onClick={onClose}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                {isEdit ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
