import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getMyDemands, IDemand } from '../services/demand.service';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const MyDemands: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [demands, setDemands] = useState<IDemand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage] = useState(1);
  const [, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadMyDemands();
  }, [isAuthenticated, navigate, currentPage]);

  const loadMyDemands = async () => {
    try {
      setLoading(true);
      const response = await getMyDemands(currentPage, 10);
      setDemands(response.data);
      setTotalPages(response.pagination.totalPages);
      setLoading(false);
    } catch (err) {
      console.error('Error loading my demands:', err);
      setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Lỗi</h3>
          <p className="mt-2 text-gray-600">{error}</p>
          <div className="mt-6">
            <button
              onClick={() => loadMyDemands()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 py-12 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-orange-600">Nhu cầu của tôi</h1>
          <Link
            to="/demands/new"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
          >
            Đăng nhu cầu mới
          </Link>
        </div>
        {demands.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-base font-medium text-gray-900">Chưa có nhu cầu nào</h3>
            <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách tạo một nhu cầu mới.</p>
            <div className="mt-6">
              <Link
                to="/demands/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Đăng nhu cầu mới
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {demands.map((demand) => (
              <div key={demand.id} className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex-1 min-w-0">
                  <Link to={`/demands/${demand.id}`} className="text-lg font-semibold text-orange-600 hover:underline">
                    {demand.title}
                  </Link>
                  <div className="mt-1 text-sm text-gray-500">Danh mục: {demand.category}</div>
                  <div className="mt-1 text-gray-700 line-clamp-2 text-sm">{demand.description}</div>
                  <div className="mt-2 flex items-center text-xs text-gray-400">
                    <span>Ngày tạo: {format(new Date(demand.created_at), 'dd/MM/yyyy', { locale: vi })}</span>
                    <span className="mx-2">•</span>
                    <span>Cập nhật: {format(new Date(demand.updated_at), 'dd/MM/yyyy', { locale: vi })}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 mt-4 md:mt-0 md:ml-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    demand.status === 'approved' ? 'bg-green-100 text-green-700' :
                    demand.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    demand.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    demand.status === 'completed' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {demand.status === 'approved' ? 'Đã duyệt' :
                    demand.status === 'pending' ? 'Chưa duyệt' :
                    demand.status === 'rejected' ? 'Từ chối' :
                    demand.status === 'completed' ? 'Hoàn thành' :
                    demand.status === 'open' ? 'Đang mở' :
                    demand.status === 'closed' ? 'Đã đóng' :
                    demand.status === 'awarded' ? 'Đã giao' :
                    demand.status}
                  </span>
                  <Link
                    to={`/demands/${demand.id}/edit`}
                    className="text-orange-500 hover:text-orange-700"
                    title="Chỉnh sửa"
                    onClick={e => e.stopPropagation()}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDemands; 