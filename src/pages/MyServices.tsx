import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getMyServices } from '../services/service.service';

const MyServices: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      if (!isAuthenticated || !user?.id) {
        setError('Bạn cần đăng nhập để xem dịch vụ của mình.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const result = await getMyServices(user.id, 1, 100);
        setServices(result.data || []);
      } catch (err) {
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [isAuthenticated, user]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ duyệt';
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Từ chối';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20 pt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-orange-600 text-center mb-8">Dịch vụ của bạn</h2>
        {loading ? (
          <div className="text-center text-lg">Đang tải...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">Bạn chưa đăng dịch vụ nào.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map(service => (
              <div key={service.id} className="bg-white rounded-lg shadow p-6 flex flex-col">
                {service.image_urls && service.image_urls.length > 0 && (
                  <img
                    src={service.image_urls[0]}
                    alt={service.title}
                    className="w-full max-h-40 object-cover rounded mb-3 border border-orange-100"
                  />
                )}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">{service.title}</h3>
                  <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(service.status)}`}>{getStatusLabel(service.status)}</span>
                </div>
                <p className="text-gray-600 line-clamp-2 mb-2">{service.description}</p>
                {service.price_range && (
                  <p className="text-sm text-gray-700 mb-2">
                    Giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.price_range.min)} - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.price_range.max)}
                  </p>
                )}
                <div className="flex gap-2 mt-auto">
                  <Link to={`/services/${service.id}/edit`} className="px-4 py-2 border border-orange-600 text-orange-600 rounded hover:bg-orange-50 text-sm">Chỉnh sửa</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyServices; 