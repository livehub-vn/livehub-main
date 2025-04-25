import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getServiceById } from '../services/service.service';
import { createServiceRental } from '../services/service_rental.service';
import DateRangePicker from '../components/DateRangePicker';

const ServiceApply = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [service, setService] = useState<any>(null);

  const [formData, setFormData] = useState({
    note: '',
    selected_time_slots: {
      start: '',
      end: ''
    },
    expect_price_range: {
      min: 0,
      max: 0,
      currency: 'VND'
    }
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
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
      
      // Khởi tạo giá mong muốn từ price_range của service
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
    if (name.startsWith('expect_price_range.')) {
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

  const handleDateRangeChange = (start: string, end: string) => {
    setFormData(prev => ({
      ...prev,
      selected_time_slots: {
        start,
        end
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user || !service) return;

    try {
      setSubmitting(true);
      setError('');

      // Validate form
      if (!formData.selected_time_slots.start || !formData.selected_time_slots.end) {
        setError('Vui lòng chọn thời gian thuê');
        return;
      }

      if (!formData.expect_price_range.min || !formData.expect_price_range.max) {
        setError('Vui lòng nhập khoảng giá mong muốn');
        return;
      }

      console.log('Submitting rental:', {
        service_id: id,
        buyer_id: user.id,
        selected_time_slots: formData.selected_time_slots,
        expect_price_range: formData.expect_price_range,
        note: formData.note
      });

      const result = await createServiceRental({
        service_id: id,
        buyer_id: user.id,
        status: 'pending',
        selected_time_slots: formData.selected_time_slots,
        expect_price_range: formData.expect_price_range,
        note: formData.note
      });

      console.log('Rental submitted successfully:', result);

      navigate(`/services/${id}`, { 
        state: { message: 'Đăng ký thuê dịch vụ thành công! Chúng tôi sẽ liên hệ với bạn sớm.' }
      });
    } catch (err: any) {
      console.error('Error submitting rental:', err);
      setError(err.message || 'Đã có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
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
            <h2 className="text-xl font-semibold text-white">Thuê dịch vụ</h2>
            <p className="mt-1 text-sm text-orange-100">
              Bạn đang thuê dịch vụ: <span className="font-medium">{service.title}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Thời gian thuê
                </label>
                <DateRangePicker
                  startDate={formData.selected_time_slots.start}
                  endDate={formData.selected_time_slots.end}
                  onChange={handleDateRangeChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Khoảng giá mong muốn
                </label>
                <div className="mt-1 flex space-x-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      name="expect_price_range.min"
                      value={formData.expect_price_range.min}
                      onChange={handleInputChange}
                      placeholder="Giá thấp nhất"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      name="expect_price_range.max"
                      value={formData.expect_price_range.max}
                      onChange={handleInputChange}
                      placeholder="Giá cao nhất"
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                  </div>
                  <div className="w-24">
                    <select
                      name="expect_price_range.currency"
                      value={formData.expect_price_range.currency}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    >
                      <option value="VND">VND</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                  Ghi chú thêm
                </label>
                <textarea
                  name="note"
                  id="note"
                  rows={4}
                  value={formData.note}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="Nhập yêu cầu hoặc ghi chú thêm của bạn..."
                />
              </div>

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

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/services')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                >
                  {submitting ? 'Đang xử lý...' : 'Thuê dịch vụ'}
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