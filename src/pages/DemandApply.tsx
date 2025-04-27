import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getDemandById } from '../services/demand.service';
import { createDemandApplication} from '../services/demand_application.service';
import Dropzone from '../components/Dropzone';


// Giả định hàm API để gửi đơn ứng tuyển


const DemandApply: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [demand, setDemand] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [contactAddress, setContactAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [promoteText, setPromoteText] = useState('');
  const [] = useState('');
  const [note, setNote] = useState('');
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
        setContactEmail(user.email || '');
        setContactPhone(user.metadata.phoneNumber || '');
        setContactAddress(user.metadata.address || '');
      } else {
        setContactEmail(user?.email || '');
        setContactPhone('');
        setContactAddress(user?.metadata?.address || '');
      }
    };

    checkAuth();
  }, [id, isAuthenticated, navigate, user]);

  useEffect(() => {
    if (user && user.metadata.role === 'BUYER') {
      setShowModal(true);
    }
  }, [user]);

  const loadDemandData = async () => {
    if (!id) {
      return;
    }
    try {
      setLoading(true);
      const demandData = await getDemandById(id);
      if (!demandData) {
        setError('Không tìm thấy thông tin nhu cầu');
        setLoading(false);
        return;
      }
      // Kiểm tra trạng thái nhu cầu
      if (!['open', 'approved'].includes(demandData.status)) {
        setError('Nhu cầu này không còn nhận ứng tuyển');
        setLoading(false);
        return;
      }
      setDemand(demandData);
      setLoading(false);
    } catch (err: any) {
      setError('Đã xảy ra lỗi khi tải dữ liệu.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user || !demand) {
      return;
    }
    try {
      setSubmitting(true);
      // Validate
      if (!contactAddress || !contactPhone || !contactEmail) {
        setError('Vui lòng nhập đầy đủ thông tin liên hệ');
        setSubmitting(false);
        return;
      }
      if (!promoteText.trim()) {
        setError('Vui lòng nhập chương trình khuyến mãi/giới thiệu');
        setSubmitting(false);
        return;
      }
      // Chuẩn bị dữ liệu
      const applicationData = {
        demand_id: id,
        contact_info: {
          address: contactAddress,
          phone: contactPhone,
          email: contactEmail
        },
        promote_text: promoteText,
        image_urls: imageUrls,
        note: note || undefined
      };
      // Gửi lên supabase
      await createDemandApplication(applicationData);
      setSubmitting(false);
      alert('Đơn ứng tuyển của bạn đã được gửi và đang chờ xử lý.');
      navigate(`/demands/${id}`);
    } catch (err: any) {
      setError('Đã xảy ra lỗi khi gửi đơn ứng tuyển: ' + (err?.message || JSON.stringify(err)));
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

  if (showModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-colors duration-300">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center transform scale-100 opacity-100">
          <h2 className="text-xl font-bold text-orange-600 mb-4">Không thể ứng tuyển</h2>
          <p className="text-gray-700 mb-6">Bạn là <span className="font-semibold">buyer</span> nên không thể ứng tuyển vào nhu cầu này.</p>
          <button
            onClick={() => setShowModal(false)}
            className="px-6 py-2 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            Đóng
          </button>
        </div>
      </div>
    );
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
              <h3 className="text-lg font-medium text-gray-900 mb-6">Thông tin liên hệ</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="contact_address" className="block text-sm font-medium text-gray-700">
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contact_address"
                    id="contact_address"
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contact_phone"
                    id="contact_phone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    id="contact_email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Thông tin ứng tuyển */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Chương trình khuyến mãi</h3>
              <div className="space-y-6">
                <div>
                  <textarea
                    name="promote_text"
                    id="promote_text"
                    rows={4}
                    value={promoteText}
                    onChange={(e) => setPromoteText(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    placeholder="Nhập chương trình khuyến mãi hoặc giới thiệu bản thân..."
                    required
                  />
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

            {/* Ghi chú cho admin */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Ghi chú cho admin</h3>
              <textarea
                name="note"
                id="note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="Nhập ghi chú cho admin (nếu có)..."
              />
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