import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getServiceById } from '../services/service.service';
import { getServiceRentalById } from '../services/service_rental.service';
import { createReview, IReviewInput } from '../services/review.service';
import Dropzone from '../components/Dropzone';

interface ServiceRentalWithService {
  id: string;
  service_id: string;
  service_title?: string;
  status: string;
  expect_price_range: any;
  service?: {
    id: string;
    title: string;
    image_urls?: string[];
  };
}

const ServiceReview: React.FC = () => {
  const { rentalId } = useParams<{ rentalId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [rental, setRental] = useState<ServiceRentalWithService | null>(null);
  const [service, setService] = useState<any | null>(null);
  
  // Form data
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      if (!rentalId) {
        setError('ID thuê dịch vụ không hợp lệ');
        setLoading(false);
        return;
      }

      try {
        // Load rental data
        const rentalData = await getServiceRentalById(rentalId);
        
        if (!rentalData) {
          setError('Không tìm thấy thông tin thuê dịch vụ');
          setLoading(false);
          return;
        }

        // Kiểm tra xem người đang đăng nhập có phải là người thuê dịch vụ này không
        if (user?.id !== rentalData.buyer_id) {
          setError('Bạn không có quyền đánh giá dịch vụ này');
          setLoading(false);
          return;
        }

        // Kiểm tra trạng thái thuê dịch vụ, chỉ cho phép đánh giá khi đã hoàn thành
        if (rentalData.status !== 'completed') {
          setError('Bạn chỉ có thể đánh giá dịch vụ sau khi đã hoàn thành');
          setLoading(false);
          return;
        }

        setRental(rentalData);

        // Load service data
        const serviceData = await getServiceById(rentalData.service_id);
        if (serviceData) {
          setService(serviceData);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [rentalId, isAuthenticated, navigate, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!service || !rental) {
      setError('Không có thông tin dịch vụ để đánh giá');
      return;
    }
    
    if (rating < 1 || rating > 5) {
      setError('Vui lòng chọn đánh giá từ 1 đến 5 sao');
      return;
    }
    
    if (!comment.trim()) {
      setError('Vui lòng nhập nhận xét của bạn');
      return;
    }
    
    try {
      setSaving(true);
      
      const reviewData: IReviewInput = {
        target_id: service.id,
        target_type: 'service',
        order_id: rental.id,
        rating,
        content: comment,
        images: []
      };
      
      const result = await createReview(reviewData);
      
      setSaving(false);
      
      if (result) {
        // Chuyển hướng đến trang chi tiết dịch vụ sau khi đánh giá thành công
        navigate(`/services/${service.id}?review=success`);
      } else {
        setError('Không thể tạo đánh giá. Vui lòng thử lại sau.');
      }
    } catch (err: any) {
      console.error('Error creating review:', err);
      setError(err.message || 'Đã xảy ra lỗi khi gửi đánh giá');
      setSaving(false);
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
              onClick={() => navigate('/service-rentals')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Quay lại danh sách thuê dịch vụ
            </button>
          </div>
        </div>
      </div>
    );
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
                  Đánh giá dịch vụ
                </h2>
              </div>
            </div>

            {service && rental && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <img
                      src={service.image_urls?.[0] || 'https://via.placeholder.com/80'}
                      alt={service.title}
                      className="h-16 w-16 object-cover rounded-md"
                    />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
                    <p className="text-sm text-gray-500">
                      Mã đơn thuê: {rental.id}
                    </p>
                    <p className="text-sm text-gray-500">
                      Giá: {rental.expect_price_range?.min && `${rental.expect_price_range.min.toLocaleString()} - `}
                      {rental.expect_price_range?.max && `${rental.expect_price_range.max.toLocaleString()} VND`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Đánh giá sao */}
              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Đánh giá của bạn <span className="text-red-500">*</span></label>
                <div className="mt-1">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <svg
                          className={`h-8 w-8 ${
                            star <= rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                    <span className="ml-2 text-gray-500">{rating}/5</span>
                  </div>
                </div>
              </div>

              {/* Nhận xét */}
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Nhận xét của bạn <span className="text-red-500">*</span></label>
                <textarea
                  id="comment"
                  name="comment"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ này..."
                  required
                />
              </div>

              {/* Hình ảnh */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Thêm hình ảnh (không bắt buộc)</label>
                <Dropzone
                  value={images}
                  onChange={setImages}
                  maxFiles={3}
                />
                <p className="mt-1 text-xs text-gray-500">Tối đa 3 ảnh</p>
              </div>

              {/* Nút hành động */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/service-rentals')}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={saving}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang gửi...
                    </>
                  ) : "Gửi đánh giá"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceReview; 