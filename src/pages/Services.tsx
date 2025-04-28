import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getServices, getMyServices } from '../services/service.service';

interface Service {
  id: string;
  title: string;
  description: string;
  image_urls?: string[];
  price_range?: {
    min: number;
    max: number;
    currency: string;
  };
  item_type: string;
  status: string;
  category?: string;
  created_at: string;
  updated_at: string;
  post_content?: string;
  owner_id?: string;
}

const Services = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMyServices, setIsMyServices] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        
        let servicesData = [];
        if (isAuthenticated && user?.id && isMyServices) {
          const result = await getMyServices(user.id, 1, 100);
          servicesData = result.data || [];
        } else {
          const result = await getServices(1, 100, { 
            status: 'approved',
            is_public: true 
          });
          servicesData = result.data || [];
        }
        
        setServices(servicesData);
        setFilteredServices(servicesData);
      } catch (err) {
        console.error('Lỗi khi tải dịch vụ:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [isAuthenticated, user, isMyServices]);

  useEffect(() => {
    const filtered = services.filter(service => 
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredServices(filtered);
  }, [searchQuery, services]);

  const toggleMyServices = () => {
    setIsMyServices(!isMyServices);
  };

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
            {isMyServices ? 'Dịch vụ của tôi' : 'Danh sách dịch vụ'}
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            {isMyServices 
              ? 'Quản lý các dịch vụ bạn đang cung cấp'
              : 'Khám phá các dịch vụ chất lượng cao'}
          </p>
        </div>

        {!isMyServices && (
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm dịch vụ..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {isAuthenticated && (
          <div className="mt-8 flex justify-center gap-4">
            {user && (
              <button
                onClick={() => {
                  if (!isMyServices) {
                    // Nếu đang ở chế độ xem tất cả, chuyển sang xem dịch vụ đã thuê
                    toggleMyServices();
                  } else {
                    // Nếu đang ở chế độ xem dịch vụ đã thuê, chuyển hướng sang /service-rentals
                    window.location.href = '/service-rentals';
                  }
                }}
                className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                {isMyServices ? 'Xem tất cả dịch vụ' : 'Xem dịch vụ đã thuê'}
              </button>
            )}
            
            {isMyServices && (
              <Link
                to="/services/create"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Thêm dịch vụ mới
              </Link>
            )}
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <div key={service.id} className="flex flex-col rounded-lg shadow-lg overflow-hidden">
              <div className="flex-shrink-0">
                <img 
                  className="h-48 w-full object-cover" 
                  src={service.image_urls?.[0] || 'https://via.placeholder.com/400x200'} 
                  alt={service.title} 
                />
              </div>
              <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-semibold text-gray-900">{service.title}</p>
                    {isMyServices && (
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(service.status)}`}>
                        {getStatusLabel(service.status)}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-base text-gray-500 line-clamp-3">{service.description}</p>
                  {service.price_range && (
                    <p className="mt-2 text-sm text-gray-700">
                      Giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.price_range.min)} - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.price_range.max)}
                    </p>
                  )}
                  {service.category && (
                    <span className="mt-2 inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {service.category}
                    </span>
                  )}
                </div>
                <div className="mt-6 flex justify-between items-center">
                  {isMyServices ? (
                    <Link
                      to={`/services/${service.id}/edit`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      Chỉnh sửa
                    </Link>
                  ) : (
                    <div className="flex space-x-2">
                      <Link
                        to={`/services/${service.id}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      >
                        Xem chi tiết
                      </Link>
                      {isAuthenticated && (
                        <Link
                          to={`/services/${service.id}/rent`}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                          Thuê dịch vụ
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="mt-12 text-center text-gray-500">
            <p>Không tìm thấy dịch vụ nào.</p>
            {isMyServices ? (
              <p className="mt-2 text-sm">Hãy tạo dịch vụ mới để bắt đầu kinh doanh.</p>
            ) : (
              <p className="mt-2 text-sm">Vui lòng thử lại sau hoặc điều chỉnh bộ lọc.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Services; 