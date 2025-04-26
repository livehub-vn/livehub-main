import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useAuthStore } from '../stores/authStore';
import { getServiceById } from '../services/service.service';
import { AccountRole } from '../types/Account';

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
  date_range?: {
    days?: string[];
  };
  contact_info?: {
    contacts?: {
      platform: string;
      value: string;
    }[];
  };
  post_content?: string;
  selected_time_slots?: {
    slots?: string[];
    days?: string[];
  };
}

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchServiceDetail = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getServiceById(id);
        
        if (!data) {
          setError('Không tìm thấy dịch vụ');
          return;
        }
        
        console.log('Service data:', data);
        console.log('Date range days:', data.date_range?.days);
        console.log('Selected time slots:', data.selected_time_slots);
        
        setService(data);
      } catch (err) {
        console.error('Error fetching service:', err);
        setError('Không thể tải thông tin dịch vụ. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetail();
  }, [id]);

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const formatDay = (day?: string) => {
    const days: Record<string, string> = {
      'mon': 'T2',
      'tue': 'T3',
      'wed': 'T4',
      'thu': 'T5',
      'fri': 'T6',
      'sat': 'T7',
      'sun': 'CN'
    };
    return day ? days[day] || day : '';
  };

  const isDayAvailable = (day: string) => {
    const dateRangeDays = service?.date_range?.days || [];
    const selectedDays = service?.selected_time_slots?.days || [];
    return dateRangeDays.includes(day) || selectedDays.includes(day);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error || 'Không tìm thấy dịch vụ'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Modal cảnh báo cho buyer */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-colors duration-300">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center transform scale-100 opacity-100">
            <h2 className="text-xl font-bold text-orange-600 mb-4">Không thể đăng ký ứng tuyển</h2>
            <p className="text-gray-700 mb-6">Bạn là <span className="font-semibold">buyer</span> nên không thể đăng ký ứng tuyển dịch vụ này.</p>
            <button
              onClick={() => setShowModal(false)}
              className="px-6 py-2 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="relative">
                {service.image_urls && service.image_urls.length > 0 ? (
                  <div>
                    <div className="aspect-w-16 aspect-h-9">
                      <img 
                        src={service.image_urls[currentImageIndex]} 
                        alt={service.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {service.image_urls.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {service.image_urls.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`w-3 h-3 rounded-full ${
                              currentImageIndex === idx ? 'bg-orange-500' : 'bg-white bg-opacity-50'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 flex items-center justify-center">
                    <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{service.title}</h1>
                
                <div className="flex items-center space-x-4 mb-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                    {service.category || 'Chưa phân loại'}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">
                    Đăng ngày {new Date(service.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <div className="prose max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {service.description}
                  </ReactMarkdown>
                </div>

                {service.post_content && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Thông tin bổ sung</h2>
                    <div className="prose max-w-none">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                      >
                        {service.post_content}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-8">
              <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin giá</h3>
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {formatCurrency(service.price_range?.min)} - {formatCurrency(service.price_range?.max)}
                  </div>
                </div>
              </div>

              <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch cho thuê</h3>
                  <div className="grid grid-cols-7 gap-2 text-sm">
                    {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => {
                      const isAvailable = isDayAvailable(day);
                      return (
                        <div 
                          key={day}
                          className={`text-center p-2 rounded-md ${
                            isAvailable 
                              ? 'bg-orange-100 text-orange-800 font-medium' 
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {formatDay(day)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {service.contact_info?.contacts && service.contact_info.contacts.length > 0 && (
                <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin liên hệ</h3>
                    <ul className="space-y-3">
                      {service.contact_info.contacts.map((contact, idx) => (
                        <li key={idx} className="flex items-center">
                          <span className="w-24 text-gray-600 capitalize">{contact.platform}:</span>
                          <span className="font-medium">{contact.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-6">
                  {isAuthenticated ? (
                    user && user.metadata.role === AccountRole.BUYER ? (
                      <div className="space-y-4">
                        <Link
                          to={`/services/${service.id}/rent`}
                          className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                           Thuê dịch vụ
                        </Link>
                        <button
                          type="button"
                          onClick={() => setShowModal(true)}
                          className="w-full inline-flex justify-center items-center px-6 py-3 border border-orange-600 rounded-md shadow-sm text-base font-medium text-orange-600 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                          Đăng ký ứng tuyển
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Link
                          to={`/services/${service.id}/rent`}
                          className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                           Thuê dịch vụ
                        </Link>
                        <Link
                          to={`/services/${service.id}/apply`}
                          className="w-full inline-flex justify-center items-center px-6 py-3 border border-orange-600 rounded-md shadow-sm text-base font-medium text-orange-600 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                          Đăng ký ứng tuyển
                        </Link>
                      </div>
                    )
                  ) : (
                    <div className="text-center space-y-4">
                      <p className="text-gray-600">Đăng nhập để sử dụng dịch vụ này</p>
                      <div className="space-x-4">
                        <Link 
                          to="/login" 
                          className="inline-flex items-center px-4 py-2 border border-orange-600 rounded-md shadow-sm text-sm font-medium text-orange-600 bg-white hover:bg-orange-50"
                        >
                          Đăng nhập
                        </Link>
                        <Link 
                          to="/register" 
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
                        >
                          Đăng ký
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail; 