import { useEffect, useState } from 'react';
import { api } from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { FolderPlus, Users } from 'lucide-react';

const ProjectList = () => {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/api/projects');
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      await api.post('/api/projects', { name: newProjectName });
      setNewProjectName('');
      setModalOpen(false);
      fetchProjects();
    } catch (error) {
      console.error('Error creating project', error);
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center">Loading projects...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your projects and team access.</p>
        </div>
        {user?.role === 'Admin' && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <FolderPlus className="mr-2 h-5 w-5" />
            New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-100">
            No projects found.
          </div>
        ) : (
          projects.map((project) => (
            <Link
              key={project._id}
              to={`/projects/${project._id}`}
              className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow group"
            >
              <div className="px-4 py-5 sm:p-6 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </h3>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span className="truncate">Admin: {project.admin?.name}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center bg-gray-50 px-3 py-2 rounded-md">
                  <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    {project.members?.length} Members
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 transform transition-all">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Create New Project</h3>
            <form onSubmit={handleCreateProject}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Project Name</label>
                <input
                  type="text" required autoFocus
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="E.g., Marketing Campaign Q4"
                />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
