import { useEffect, useState } from 'react';
import { api } from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { CheckCircle2, AlertCircle, Clock, LayoutList } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data } = await api.get('/api/dashboard');
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching dashboard metrics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return <div className="flex h-full items-center justify-center">Loading dashboard...</div>;
  }

  const statusMap = metrics?.tasksByStatus.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {}) || {};

  const stats = [
    { name: 'Total Tasks', value: metrics?.totalTasks || 0, icon: LayoutList, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'In Progress', value: statusMap['In Progress'] || 0, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { name: 'Completed', value: statusMap['Done'] || 0, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Overdue', value: metrics?.overdueTasks || 0, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back, {user?.name}. Here's what's happening with your projects today.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mt-6">
        {stats.map((item) => (
          <div key={item.name} className="relative bg-white pt-5 px-4 pb-6 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden border border-gray-100">
            <dt>
              <div className={`absolute rounded-md p-3 ${item.bg}`}>
                <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">{item.name}</p>
            </dt>
            <dd className="ml-16 pb-2 flex items-baseline sm:pb-3">
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
            </dd>
          </div>
        ))}
      </div>

      {user?.role === 'Admin' && metrics?.tasksPerUser && metrics.tasksPerUser.length > 0 && (
        <div className="mt-8 bg-white border border-gray-100 shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Team Workload</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {metrics.tasksPerUser.map((u) => (
              <li key={u._id} className="px-6 py-4 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{u.name || 'Unassigned'}</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {u.count} tasks
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
