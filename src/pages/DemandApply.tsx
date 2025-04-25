import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getDemandById } from '../services/demand.service';
import Dropzone from '../components/Dropzone';

// Interface cho đơn ứng tuyển
interface IApplicationInput {
  demand_id: string;
  supplier_id: string;
  promote_text: string;
  image_urls: string[];
  note?: string;
  contact_info: string;
}

// Giả định hàm API để gửi đơn ứng tuyển
const submitApplication = async (application: IApplicationInput) => {
  // Mock API - Chờ một giây
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Giả định kết quả thành công
  return {
    id: 'new-application-id',
    ...application,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};


const DemandApply: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [demand, setDemand] = useState<any>(null);
  
  // Form state
  const [promoteText, setPromoteText] = useState('');
  const [note, setNote] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      if (!id) {
        navigate('/demands');
        return;
      }

      await loadDemandData();

      // Cập nhật cách truy cập thông tin người dùng
      if (user?.metadata) {
        const contactText = [
          `Người liên hệ: ${user.metadata.fullName}`,
          `Email: ${user.email}`
        ].filter(Boolean).join('\n');
        
        setContactInfo(contactText);
      } else {
        setContactInfo(`Người liên hệ: ${user?.email}\nEmail: ${user?.email}`);
      }
    };

    checkAuth();
  }, [id, isAuthenticated, navigate, user]);

  const loadDemandData = async () => {
    if (!id) {
      console.log('No demand ID provided');
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching demand data for ID:', id);
      
      const demandData = await getDemandById(id);
      console.log('Received demand data:', demandData);
      
      if (!demandData) {
        console.log('No demand data found');
        setError('Không tìm thấy thông tin nhu cầu');
        setLoading(false);
        return;
      }

      // Kiểm tra xem người dùng có phải là người tạo demand không
      if (user?.id === demandData.creator) {
        console.log('User is the creator of this demand');
        setError('Bạn không thể ứng tuyển vào nhu cầu do chính mình tạo');
        setLoading(false);
        return;
      }

      // Kiểm tra trạng thái nhu cầu
      if (demandData.status !== 'open') {
        console.log('Demand is not open:', demandData.status);
        setError('Nhu cầu này không còn nhận ứng tuyển');
        setLoading(false);
        return;
      }

      setDemand(demandData);
      setLoading(false);
    } catch (err: any) {
      console.error('Detailed error when loading demand:', {
        error: err,
        message: err.message,
        stack: err.stack,
        response: err.response?.data
      });
      
      let errorMessage = 'Đã xảy ra lỗi khi tải dữ liệu.';
      if (err.response?.data?.message) {
        errorMessage += ` Chi tiết: ${err.response.data.message}`;
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !user || !demand) {
      console.log('Missing required data:', { id, user, demand });
      return;
    }

    try {
      setSubmitting(true);
      console.log('Starting submission with data:', {
        demand_id: id,
        supplier_id: user.id,
        promote_text: promoteText,
        image_urls: imageUrls,
        note,
        contact_info: contactInfo
      });

      // Kiểm tra các trường bắt buộc
      if (!promoteText.trim()) {
        setError('Vui lòng nhập nội dung quảng bá');
        setSubmitting(false);
        return;
      }

      if (!contactInfo.trim()) {
        setError('Vui lòng nhập thông tin liên hệ');
        setSubmitting(false);
        return;
      }

      // Chuẩn bị dữ liệu đơn ứng tuyển
      const applicationData: IApplicationInput = {
        demand_id: id,
        supplier_id: user.id,
        promote_text: promoteText,
        image_urls: imageUrls,
        note: note || undefined,
        contact_info: contactInfo
      };

      console.log('Sending application data:', applicationData);

      // Gửi đơn ứng tuyển
      const response = await submitApplication(applicationData);
      console.log('Application submission response:', response);

      // Chuyển hướng đến trang chi tiết nhu cầu
      setSubmitting(false);
      navigate(`/demands/${id}`);
      
      // Hiển thị thông báo thành công
      alert('Đơn ứng tuyển của bạn đã được gửi thành công!');
    } catch (err: any) {
      console.error('Detailed error when submitting application:', {
        error: err,
        message: err.message,
        stack: err.stack,
        response: err.response?.data
      });
      
      let errorMessage = 'Đã xảy ra lỗi khi gửi đơn ứng tuyển.';
      if (err.response?.data?.message) {
        errorMessage += ` Chi tiết: ${err.response.data.message}`;
      }
      setError(errorMessage);
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/demands/${id}`);
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
              onClick={() => navigate('/demands')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Quay lại danh sách nhu cầu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!demand) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-orange-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Đăng ký nhu cầu</h2>
                <p className="mt-1 text-orange-100">
                  Bạn đang đăng ký nhu cầu: <span className="font-medium">{demand.title}</span>
                </p>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-orange-700 hover:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-orange-600 focus:ring-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Quay lại
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Thông tin cá nhân */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Thông tin cá nhân</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="contact_info.name" className="block text-sm font-medium text-gray-700">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contact_info.name"
                    id="contact_info.name"
                    value={contactInfo.split('\n')[0].split(': ')[1]}
                    onChange={(e) => setContactInfo(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contact_info.phone" className="block text-sm font-medium text-gray-700">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="contact_info.phone"
                      id="contact_info.phone"
                      value={contactInfo.split('\n')[1].split(': ')[1]}
                      onChange={(e) => setContactInfo(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="contact_info.email" className="block text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="contact_info.email"
                      id="contact_info.email"
                      value={contactInfo.split('\n')[2].split(': ')[1]}
                      onChange={(e) => setContactInfo(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin ứng tuyển */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Thông tin ứng tuyển</h3>
              <div className="space-y-6">
                <div>
                  <label htmlFor="promotional_text" className="block text-sm font-medium text-gray-700">
                    Giới thiệu bản thân <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <textarea
                      name="promotional_text"
                      id="promotional_text"
                      rows={4}
                      value={promoteText}
                      onChange={(e) => setPromoteText(e.target.value)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      placeholder="Giới thiệu ngắn gọn về bản thân và kinh nghiệm của bạn..."
                      required
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Hãy nêu rõ kinh nghiệm và kỹ năng liên quan đến nhu cầu này
                  </p>
                </div>

                <div>
                  <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                    Ghi chú thêm
                  </label>
                  <div className="mt-1">
                    <textarea
                      name="note"
                      id="note"
                      rows={4}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      placeholder="Nhập yêu cầu hoặc ghi chú thêm của bạn..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hình ảnh minh họa
                  </label>
                  <Dropzone
                    value={imageUrls}
                    onChange={setImageUrls}
                    maxFiles={5}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Tải lên tối đa 5 hình ảnh minh họa cho kinh nghiệm của bạn
                  </p>
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </span>
                ) : 'Gửi đơn đăng ký'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DemandApply; 