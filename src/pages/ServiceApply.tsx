import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getServiceById } from '../services/service.service';
import { createServiceRental } from '../services/service_rental.service';
import Dropzone from '../components/Dropzone';

interface IContactInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface IFormData {
  contact_info: IContactInfo;
  expect_price_range: {
    min: number;
    max: number;
    currency: string;
  };
  image_urls: string[];
  note: string;
  promote_text?: string;
}

const ServiceApply = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [service, setService] = useState<any>(null);
  const [formData, setFormData] = useState<IFormData>({
    contact_info: {
      name: '',
      phone: '',
      email: '',
      address: ''
    },
    expect_price_range: {
      min: 0,
      max: 0,
      currency: 'VND'
    },
    image_urls: [],
    note: '',
    promote_text: ''
  });
  const [supplierId, setSupplierId] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user && user.metadata.role === 'BUYER') {
      setShowModal(true);
      return;
    }

    loadServiceData();
  }, [isAuthenticated, user, navigate, id]);

  const loadServiceData = async () => {
    try {
      if (!id) return;
      setLoading(true);
      const data = await getServiceById(id);
      if (!data) {
        setError('Không tìm thấy dịch vụ');
        return;
      }
      setService(data);
      setSupplierId(data.owner_id || '');
      if (data.price_range) {
        setFormData(prev => ({
          ...prev,
          expect_price_range: {
            min: data.price_range.min || 0,
            max: data.price_range.max || 0,
            currency: data.price_range.currency || 'VND'
          }
        }));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('contact_info.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contact_info: {
          ...prev.contact_info,
          [field]: value
        }
      }));
    } else if (name.startsWith('expect_price_range.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        expect_price_range: {
          ...prev.expect_price_range,
          [field]: field === 'currency' ? value : Number(value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };


  const handleImageChange = (urls: string[]) => {
    setFormData(prev => ({ ...prev, image_urls: urls }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Vui lòng đăng nhập để ứng tuyển');
      return;
    }
    try {
      setSubmitting(true);
      const result = await createServiceRental({
        buyer_id: user.id,
        supplier_id: supplierId,
        contact_info: formData.contact_info,
        expect_price_range: formData.expect_price_range,
        image_urls: formData.image_urls,
        note: formData.note,
        promote_text: formData.promote_text,
        status: 'pending',
        service_id: id || ''
      } as any);
      if (result?.id) {
        navigate(`/service-rentals/${result.id}`);
      } else {
        setError('Không thể đăng ký ứng tuyển. Vui lòng thử lại sau.');
      }
    } catch (err) {
      console.error('Error applying for service:', err);
      setError('Đã xảy ra lỗi khi đăng ký ứng tuyển');
    } finally {
      setSubmitting(false);
    }
  };

  if (showModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm transition-colors duration-300">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center transform scale-100 opacity-100">
          <h2 className="text-xl font-bold text-orange-600 mb-4">Không thể ứng tuyển</h2>
          <p className="text-gray-700 mb-6">Bạn là <span className="font-semibold">buyer</span> nên không thể ứng tuyển vào dịch vụ này.</p>
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
              onClick={() => navigate('/services')}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              Quay lại danh sách dịch vụ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return null;
  }

  return (
    <div className="min-h-screen bg-orange-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-orange-500">
            <h2 className="text-xl font-semibold text-white">Đăng ký ứng tuyển dịch vụ</h2>
            <p className="mt-1 text-sm text-orange-100">
              Bạn đang đăng ký ứng tuyển dịch vụ: <span className="font-medium">{service.title}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-orange-600">Thông tin người ứng tuyển</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contact_info.name" className="block text-sm font-medium text-orange-700">Tên người ứng tuyển <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      id="contact_info.name"
                      name="contact_info.name"
                      required
                      value={formData.contact_info.name || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-orange-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact_info.email" className="block text-sm font-medium text-orange-700">Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      id="contact_info.email"
                      name="contact_info.email"
                      required
                      value={formData.contact_info.email || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-orange-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label htmlFor="contact_info.phone" className="block text-sm font-medium text-orange-700">Số điện thoại <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      id="contact_info.phone"
                      name="contact_info.phone"
                      required
                      value={formData.contact_info.phone || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-orange-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact_info.address" className="block text-sm font-medium text-orange-700">Địa chỉ</label>
                    <input
                      type="text"
                      id="contact_info.address"
                      name="contact_info.address"
                      value={formData.contact_info.address || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-orange-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="promote_text" className="block text-sm font-medium text-orange-700">Chương trình khuyến mãi <span className="text-red-500">*</span></label>
                <textarea
                  id="promote_text"
                  name="promote_text"
                  value={formData.promote_text || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1 block w-full border border-orange-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="Nhập thông tin về chương trình khuyến mãi, ưu đãi hoặc cam kết của bạn..."
                  required
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-orange-600">Hình ảnh minh họa</h3>
                <Dropzone value={formData.image_urls} onChange={handleImageChange} maxFiles={5} />
              </div>
              <div>
                <label htmlFor="note" className="block text-sm font-medium text-orange-700">Ghi chú cho admin</label>
                <textarea
                  id="note"
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1 block w-full border border-orange-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="Nhập ghi chú cho admin..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/services')}
                  className="inline-flex items-center px-4 py-2 border border-orange-300 shadow-sm text-sm font-medium rounded-md text-orange-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                >
                  {submitting ? 'Đang xử lý...' : 'Đăng ký ứng tuyển'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceApply; 