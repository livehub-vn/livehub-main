import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getMyRentedServices } from '../services/service_rental.service';

interface ServiceRental {
  id: string;
  service_id: string;
  status: string;
  selected_time_slots: {
    start: string;
    end: string;
  };
  expect_price_range: {
    min: number;
    max: number;
    currency: string;
  };
  note?: string;
  contact_info: {
    name: string;
    phone: string;
    email: string;
    address?: string;
  };
  service?: {
    title: string;
    description: string;
    image_urls?: string[];
  };
  created_at: string;
  updated_at: string;
}

const MyRentedServices: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [rentals, setRentals] = useState<ServiceRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRentals = async () => {
      if (!isAuthenticated || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await getMyRentedServices(user.id);
        setRentals(result.data || []);
      } catch (err) {
        console.error('Lỗi khi tải danh sách dịch vụ đã thuê:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchRentals();
  }, [isAuthenticated, user]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ duyệt';
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Từ chối';
      case 'in_progress': return 'Đang thực hiện';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Dịch vụ bạn đã thuê
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Xem lại các dịch vụ bạn đã thuê và trạng thái của chúng
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {rentals.map((rental) => (
            <div key={rental.id} className="flex flex-col rounded-lg shadow-lg overflow-hidden">
              <div className="flex-shrink-0">
                <img 
                  className="h-48 w-full object-cover" 
                  src={rental.service?.image_urls?.[0] || 'https://via.placeholder.com/400x200'} 
                  alt={rental.service?.title || 'Dịch vụ'} 
                />
              </div>
              <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-semibold text-gray-900">{rental.service?.title}</p>
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(rental.status)}`}>
                      {getStatusLabel(rental.status)}
                    </span>
                  </div>
                  <p className="mt-3 text-base text-gray-500 line-clamp-3">{rental.service?.description}</p>
                  <div className="mt-4">
                    <p className="text-sm text-gray-700">
                      Thời gian: {new Date(rental.selected_time_slots.start).toLocaleString()} - {new Date(rental.selected_time_slots.end).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-700">
                      Giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(rental.expect_price_range.min)} - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(rental.expect_price_range.max)}
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <Link
                    to={`/service-rentals/${rental.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {rentals.length === 0 && (
          <div className="mt-12 text-center text-gray-500">
            <p>Bạn chưa thuê dịch vụ nào.</p>
            <p className="mt-2 text-sm">Hãy khám phá các dịch vụ có sẵn và bắt đầu thuê ngay!</p>
            <Link
              to="/services"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Xem dịch vụ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRentedServices; 