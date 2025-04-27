import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getMyDemandApplications } from '../services/demand_application.service';
import { Link } from 'react-router-dom';

const statusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-orange-100 text-orange-700 border border-orange-300';
    case 'approved': return 'bg-green-100 text-green-700 border border-green-300';
    case 'rejected': return 'bg-red-100 text-red-700 border border-red-300';
    default: return 'bg-gray-100 text-gray-700 border border-gray-300';
  }
};

const MyApplications: React.FC = () => {
  useAuthStore();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getMyDemandApplications();
        setApplications(data || []);
      } catch (err) {
        setError('Không thể tải danh sách đơn ứng tuyển.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-orange-600 font-semibold">Đang tải...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto py-12 px-2 sm:px-6 lg:px-8 pt-24">
      <h2 className="text-3xl font-bold mb-8 text-orange-600 text-center">Các đơn ứng tuyển của bạn</h2>
      {applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">Bạn chưa có đơn ứng tuyển nào.</div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-orange-200">
            <thead className="bg-orange-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">Tên nhu cầu</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">Ngày ứng tuyển</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-orange-100">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-orange-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{app.demand_title || (app.demand && app.demand.title) || app.demand_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColor(app.status)}`}>{app.status === 'pending' ? 'Chờ duyệt' : app.status === 'approved' ? 'Đã duyệt' : app.status === 'rejected' ? 'Từ chối' : app.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{new Date(app.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link to={`/my-applications/${app.id}`} className="inline-block px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition font-semibold text-sm shadow">Xem chi tiết</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyApplications; 