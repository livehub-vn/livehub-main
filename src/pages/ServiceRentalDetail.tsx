import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getServiceRentalById, cancelServiceRental } from '../services/service_rental.service';
import { getServiceById } from '../services/service.service';

const ServiceRentalDetail: React.FC = () => {
  const { rentalId } = useParams<{ rentalId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [rental, setRental] = useState<any>(null);
  const [service, setService] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      if (rentalId) {
        await loadRentalData();
      } else {
        setError('Không tìm thấy thông tin đơn thuê dịch vụ');
        setLoading(false);
      }
    };

    checkAuth();
  }, [rentalId, isAuthenticated, navigate]);

  const loadRentalData = async () => {
    if (!rentalId) return;

    try {
      setLoading(true);
      const rentalData = await getServiceRentalById(rentalId);
      
      if (!rentalData) {
        setError('Không tìm thấy thông tin đơn thuê dịch vụ');
        setLoading(false);
        return;
      }

      // Kiểm tra quyền xem đơn thuê
      if (user?.id !== rentalData.buyer_id) {
        setError('Bạn không có quyền xem đơn thuê dịch vụ này');
        setLoading(false);
        return;
      }

      setRental(rentalData);

      // Lấy thông tin dịch vụ
      if (rentalData.service_id) {
        const serviceData = await getServiceById(rentalData.service_id);
        if (serviceData) {
          setService(serviceData);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading rental data:', err);
      setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!rentalId) return;

    try {
      setProcessing(true);
      const result = await cancelServiceRental(rentalId, 'Hủy bởi người dùng');
      if (result) {
        await loadRentalData(); // Tải lại dữ liệu sau khi hủy
      } else {
        setError('Không thể hủy đơn thuê dịch vụ. Vui lòng thử lại sau.');
      }
      setProcessing(false);
    } catch (err) {
      console.error('Error canceling rental:', err);
      setError('Đã xảy ra lỗi khi hủy đơn thuê dịch vụ. Vui lòng thử lại sau.');
      setProcessing(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'pending': return 'Đang chờ xác nhận';
      case 'approved': return 'Đã xác nhận';
      case 'rejected': return 'Đã từ chối';
      case 'canceled': return 'Đã hủy';
      case 'completed': return 'Hoàn thành';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'canceled': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const getDayDisplay = (day: string) => {
    switch(day) {
      case 'mon': return 'Thứ Hai';
      case 'tue': return 'Thứ Ba';
      case 'wed': return 'Thứ Tư';
      case 'thu': return 'Thứ Năm';
      case 'fri': return 'Thứ Sáu';
      case 'sat': return 'Thứ Bảy';
      case 'sun': return 'Chủ Nhật';
      default: return day;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
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
              onClick={() => navigate('/service-rentals')}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              Quay lại danh sách đơn đăng ký
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Parse contact info if exists
  let contactInfo = {};
  try {
    if (rental?.contact_info) {
      contactInfo = JSON.parse(rental.contact_info);
    }
  } catch (err) {
    console.error('Error parsing contact info:', err);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/service-rentals')}
                  className="mr-2 text-gray-600 hover:text-gray-900"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold text-gray-900">
                  Chi tiết đơn đăng ký thuê dịch vụ
                </h2>
              </div>
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(rental?.status)}`}>
                  {getStatusDisplay(rental?.status)}
                </span>
              </div>
            </div>

            {/* Thông tin dịch vụ */}
            {service && (
              <div className="border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold mb-2">Thông tin dịch vụ</h3>
                <div className="grid grid-cols-1 gap-2">
                  <div>
                    <span className="text-gray-600">Tên dịch vụ: </span>
                    <span className="font-medium">{service.title}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Danh mục: </span>
                    <span className="font-medium">{service.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Giá tham khảo: </span>
                    <span className="font-medium">{service.price_range?.min?.toLocaleString()} - {service.price_range?.max?.toLocaleString()} {service.price_range?.currency}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/services/${service.id}`)}
                    className="text-orange-600 hover:text-orange-800 text-sm"
                  >
                    Xem chi tiết dịch vụ
                  </button>
                </div>
              </div>
            )}

            {/* Thông tin đơn đăng ký */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Thông tin đơn đăng ký</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Thông tin người đăng ký</h4>
                  <div className="grid grid-cols-1 gap-1">
                    <div>
                      <span className="text-gray-600">Họ tên: </span>
                      <span className="font-medium">{(contactInfo as any)?.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email: </span>
                      <span className="font-medium">{(contactInfo as any)?.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Số điện thoại: </span>
                      <span className="font-medium">{(contactInfo as any)?.phone}</span>
                    </div>
                    {(contactInfo as any)?.address && (
                      <div>
                        <span className="text-gray-600">Địa chỉ: </span>
                        <span className="font-medium">{(contactInfo as any)?.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Thông tin đơn hàng</h4>
                  <div className="grid grid-cols-1 gap-1">
                    <div>
                      <span className="text-gray-600">Mã đơn: </span>
                      <span className="font-medium">{rental?.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Ngày đăng ký: </span>
                      <span className="font-medium">{formatDate(rental?.created_at)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Trạng thái: </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClass(rental?.status)}`}>
                        {getStatusDisplay(rental?.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ngày đăng ký */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Các ngày đăng ký thuê</h4>
                <div className="flex flex-wrap gap-2">
                  {rental?.selected_time_slots?.map((slot: string, index: number) => (
                    <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                      {getDayDisplay(slot)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ngân sách */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Ngân sách dự kiến</h4>
                <div>
                  <span className="font-medium">
                    {rental?.expect_price_range?.min?.toLocaleString()} - {rental?.expect_price_range?.max?.toLocaleString()} {rental?.expect_price_range?.currency}
                  </span>
                </div>
              </div>

              {/* Ghi chú */}
              {rental?.note && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Ghi chú</h4>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-gray-700">{rental.note}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Nút hành động */}
            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/service-rentals')}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Quay lại
              </button>
              
              {rental?.status === 'pending' && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={processing}
                  className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {processing ? 'Đang xử lý...' : 'Hủy đơn đăng ký'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceRentalDetail; 