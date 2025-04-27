import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getServiceById } from '../services/service.service';
import { createServiceRental } from '../services/service_rental.service';
import ReactMarkdown from 'react-markdown';

interface TimeSlot {
  start: string;
  end: string;
}

interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  address?: string;
}

interface IServiceRentalInput {
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'cancelled';
  service_id: string;
  buyer_id: string;
  selected_time_slots: TimeSlot;
  expect_price_range: {
    min: number;
    max: number;
    currency: string;
  };
  note?: string;
  contact_info: ContactInfo;
  previous_service_experience?: string;
}

const ServiceRentalForm: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [service, setService] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState<IServiceRentalInput>({
    status: 'pending',
    service_id: serviceId || '',
    buyer_id: user?.id || '',
    selected_time_slots: {
      start: '',
      end: ''
    },
    expect_price_range: {
      min: 0,
      max: 0,
      currency: 'VND'
    },
    note: '',
    contact_info: {
      name: '',
      phone: '',
      email: '',
      address: ''
    },
    previous_service_experience: ''
  });
  const [, setSupplierId] = useState<string>('');

  const [] = useState<string[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        navigate('/login', { state: { redirect: `/services/${serviceId}/rent` } });
        return;
      }

      if (serviceId) {
        await loadServiceData();
      } else {
        setError('Không tìm thấy thông tin dịch vụ');
        setLoading(false);
      }
    };

    checkAuth();
  }, [serviceId, isAuthenticated, navigate]);

  const loadServiceData = async () => {
    if (!serviceId) return;

    try {
      setLoading(true);
      const serviceData = await getServiceById(serviceId);
      
      if (!serviceData) {
        setError('Không tìm thấy thông tin dịch vụ');
        setLoading(false);
        return;
      }

      setService(serviceData);
      setSupplierId(serviceData.owner_id || '');
      
      // Cập nhật form data với thông tin dịch vụ
      setFormData(prev => ({
        ...prev,
        service_id: serviceId,
        buyer_id: user?.id || '',
        expect_price_range: serviceData.price_range || {
          min: 0,
          max: 0,
          currency: 'VND'
        }
      }));

      setLoading(false);
    } catch (err) {
      console.error('Error loading service data:', err);
      setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const handleTimeSlotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      selected_time_slots: {
        ...prev.selected_time_slots,
        [name]: value
      }
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
          [field]: value
        }
      }));
    } else if (name === 'previous_service_experience') {
      setFormData(prev => ({
        ...prev,
        previous_service_experience: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const contactInfo = formData.contact_info;
        
      if (!contactInfo.name || !contactInfo.phone || !contactInfo.email) {
        setError('Vui lòng điền đầy đủ thông tin liên hệ');
        setSaving(false);
        return;
      }

      if (!formData.selected_time_slots.start || !formData.selected_time_slots.end) {
        setError('Vui lòng chọn thời gian bắt đầu và kết thúc');
        setSaving(false);
        return;
      }

      const rentalData = {
        status: 'pending' as const,
        service_id: formData.service_id,
        buyer_id: formData.buyer_id,
        selected_time_slots: formData.selected_time_slots,
        expect_price_range: formData.expect_price_range,
        note: formData.note,
        contact_info: formData.contact_info,
        previous_service_experience: formData.previous_service_experience
      };

      // Tạo đơn thuê dịch vụ
      const result = await createServiceRental(rentalData);
      
      if (result?.id) {
        // Chuyển hướng đến trang chi tiết đơn thuê
        navigate(`/service-rentals/${result.id}`);
      } else {
        setError('Không thể thuê dịch vụ. Vui lòng thử lại sau.');
      }

      setSaving(false);
    } catch (err) {
      console.error('Error saving service rental:', err);
      setError('Đã xảy ra lỗi khi thuê dịch vụ. Vui lòng thử lại sau.');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/services/${serviceId}`);
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
              onClick={() => navigate(`/services/${serviceId}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Quay lại trang dịch vụ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={handleCancel}
          className="mb-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          ← Quay lại trang dịch vụ
        </button>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Thuê dịch vụ
                </h2>
              </div>
            </div>

            {service && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">
                  <ReactMarkdown>{service.title}</ReactMarkdown>
                </h3>
                <p className="text-gray-600">
                  <ReactMarkdown>{service.description}</ReactMarkdown>
                </p>
                <div className="mt-2">
                  <span className="text-gray-700 font-medium">Giá tham khảo: </span>
                  <span className="text-blue-600">{service.price_range.min.toLocaleString()} - {service.price_range.max.toLocaleString()} {service.price_range.currency}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-orange-600">Thông tin người thuê</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contact_info.name" className="block text-sm font-medium text-orange-700">Tên người thuê <span className="text-red-500">*</span></label>
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
                <h3 className="text-lg font-semibold mb-4 text-orange-600">Thời gian thuê dịch vụ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="start" className="block text-sm font-medium text-orange-700">Bắt đầu <span className="text-red-500">*</span></label>
                    <input
                      type="datetime-local"
                      id="start"
                      name="start"
                      value={formData.selected_time_slots.start}
                      onChange={handleTimeSlotChange}
                      className="mt-1 block w-full border border-orange-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="end" className="block text-sm font-medium text-orange-700">Kết thúc <span className="text-red-500">*</span></label>
                    <input
                      type="datetime-local"
                      id="end"
                      name="end"
                      value={formData.selected_time_slots.end}
                      onChange={handleTimeSlotChange}
                      className="mt-1 block w-full border border-orange-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>
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
                  placeholder="Nhập các yêu cầu, thông tin bổ sung hoặc mong muốn về dịch vụ..."
                />
              </div>
              <div>
                <label htmlFor="previous_service_experience" className="block text-sm font-medium text-orange-700">Trải nghiệm trước đó</label>
                <textarea
                  id="previous_service_experience"
                  name="previous_service_experience"
                  value={formData.previous_service_experience || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full border border-orange-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="Nhập mô tả về trải nghiệm dịch vụ bạn đã từng thuê trước đó..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-orange-300 shadow-sm text-sm font-medium rounded-md text-orange-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  disabled={saving}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xử lý...
                    </>
                  ) : "Thuê dịch vụ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceRentalForm; 