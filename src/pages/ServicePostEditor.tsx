import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { createService, updateService, getServiceById } from '../services/service.service';
import { IServiceInput } from '../services/service.service';
import RichtextEditor from '../components/RichtextEditorComponent';
import Dropzone from '../components/Dropzone';

// Mở rộng interface IServiceInput để thêm trường note
interface IExtendedServiceInput extends IServiceInput {
  note?: string;
  languages?: string;
}

const ServiceCreateForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState<IExtendedServiceInput>({
    title: '',
    description: '',
    category: '',
    price_range: {
      min: 0,
      max: 0,
      currency: 'VND'
    },
    date_range: {
      days: []
    },
    image_urls: [],
    status: 'pending', // Trạng thái mặc định là pending
    is_public: true,
    note: '',
    languages: ''
  });

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      if (id) {
        setIsEditing(true);
        await loadServiceData();
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [id, isAuthenticated, navigate]);

  const loadServiceData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const serviceData = await getServiceById(id);
      
      if (!serviceData) {
        setError('Không tìm thấy thông tin dịch vụ');
        setLoading(false);
        return;
      }

      // Kiểm tra quyền chỉnh sửa
      if (user?.id !== serviceData.owner_id) {
        setError('Bạn không có quyền chỉnh sửa dịch vụ này');
        setLoading(false);
        return;
      }

      // Cập nhật form data từ service đã tồn tại
      setFormData({
        title: serviceData.title,
        description: serviceData.description,
        category: serviceData.category,
        price_range: serviceData.price_range || {
          min: 0,
          max: 0,
          currency: 'VND'
        },
        date_range: serviceData.date_range || {
          days: []
        },
        image_urls: serviceData.image_urls || [],
        status: serviceData.status,
        is_public: serviceData.is_public !== undefined ? serviceData.is_public : true,
        note: serviceData.note || '',
        languages: serviceData.languages || ''
      });

      setLoading(false);
    } catch (err) {
      console.error('Error loading service data:', err);
      setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Xử lý trường lồng nhau (nested fields)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'price_range') {
        setFormData({
          ...formData,
          price_range: {
            ...formData.price_range,
            [child]: value
          }
        });
      } else if (parent === 'date_range') {
        setFormData({
          ...formData,
          date_range: {
            ...formData.date_range || { days: [] },
            [child]: value
          }
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Kiểm tra validation
      if (!formData.title.trim()) {
        setError('Vui lòng nhập tiêu đề dịch vụ');
        return;
      }
      
      if (!formData.description.trim()) {
        setError('Vui lòng nhập mô tả dịch vụ');
        return;
      }
      
      if (!formData.category.trim()) {
        setError('Vui lòng chọn danh mục dịch vụ');
        return;
      }
      
      if (isNaN(Number(formData.price_range.min)) || isNaN(Number(formData.price_range.max))) {
        setError('Khoảng giá không hợp lệ');
        return;
      }

      if (Number(formData.price_range.min) < 0 || Number(formData.price_range.max) < 0) {
        setError('Khoảng giá không thể là số âm');
        return;
      }

      if (Number(formData.price_range.min) > Number(formData.price_range.max)) {
        setError('Giá tối thiểu không thể lớn hơn giá tối đa');
        return;
      }
      
      setSaving(true);

      // Đảm bảo các giá trị số được chuyển đổi đúng
      const priceRange = {
        min: Number(formData.price_range.min),
        max: Number(formData.price_range.max),
        currency: formData.price_range.currency
      };

      // Chuẩn bị dữ liệu dịch vụ
      const serviceData: IExtendedServiceInput = {
        ...formData,
        price_range: priceRange,
        status: 'pending' // Đảm bảo trạng thái luôn là pending khi tạo mới
      };
      
      // In ra để debug
      console.log('Submitting service data:', serviceData);
      console.log('Date range days:', serviceData.date_range?.days);

      if (isEditing && id) {
        try {
          // Cập nhật dịch vụ
          const result = await updateService(id, serviceData);
          if (result) {
            console.log('Service updated successfully:', result);
            navigate(`/services/${id}`);
          } else {
            setError('Không thể cập nhật dịch vụ. Phản hồi từ server không hợp lệ.');
          }
        } catch (updateError: any) {
          console.error('Error updating service:', updateError);
          setError(`Lỗi khi cập nhật: ${updateError.message || 'Không xác định'}`);
        }
      } else {
        try {
          // Tạo dịch vụ mới
          const result = await createService(serviceData);
          if (result?.id) {
            console.log('Service created successfully:', result);
            navigate(`/services/${result.id}`);
          } else {
            setError('Không thể tạo dịch vụ. Phản hồi từ server không hợp lệ.');
          }
        } catch (createError: any) {
          console.error('Error creating service:', createError);
          setError(`Lỗi khi tạo: ${createError.message || 'Không xác định'}`);
        }
      }

      setSaving(false);
    } catch (err: any) {
      console.error('Error saving service:', err);
      setError(`Đã xảy ra lỗi khi lưu dịch vụ: ${err.message || 'Vui lòng thử lại sau.'}`);
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isEditing && id) {
      navigate(`/services/${id}`);
    } else {
      navigate('/services');
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
          {error.includes('đăng nhập') && (
            <p className="mt-2 text-sm text-gray-500">Vui lòng đăng nhập lại để tiếp tục.</p>
          )}
          <div className="mt-6 flex flex-col md:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/services')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Quay lại danh sách dịch vụ
            </button>
            {error.includes('đăng nhập') && (
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Đăng nhập lại
              </button>
            )}
            <button
              onClick={() => {
                setError('');
                setLoading(false);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Thử lại
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
                  onClick={handleCancel}
                  className="mr-2 text-gray-600 hover:text-gray-900"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEditing ? "Chỉnh sửa dịch vụ" : "Đăng dịch vụ mới"}
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tiêu đề */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Tiêu đề <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Mô tả */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Mô tả chi tiết <span className="text-red-500">*</span></label>
                <RichtextEditor
                  markdown={formData.description}
                  onChange={(value) => setFormData({...formData, description: value})}
                />
              </div>

              {/* Danh mục */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">Danh mục <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="Nhập danh mục..."
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Ngân sách */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="price_range.min" className="block text-sm font-medium text-gray-700">Khoảng giá tối thiểu <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    id="price_range.min"
                    name="price_range.min"
                    required
                    value={formData.price_range.min}
                    onChange={handleInputChange}
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="price_range.max" className="block text-sm font-medium text-gray-700">Khoảng giá tối đa <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    id="price_range.max"
                    name="price_range.max"
                    required
                    value={formData.price_range.max}
                    onChange={handleInputChange}
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Thời gian */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="date_range.days" className="block text-sm font-medium text-gray-700">Ngày cho thuê trong tuần</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {formData.date_range?.days && formData.date_range.days.length > 0 && formData.date_range.days.map((day) => (
                      <div key={day} className="inline-flex items-center bg-blue-100 text-blue-800 rounded-md px-2 py-1">
                        {day === 'mon' && 'Thứ Hai'}
                        {day === 'tue' && 'Thứ Ba'}
                        {day === 'wed' && 'Thứ Tư'}
                        {day === 'thu' && 'Thứ Năm'}
                        {day === 'fri' && 'Thứ Sáu'}
                        {day === 'sat' && 'Thứ Bảy'}
                        {day === 'sun' && 'Chủ Nhật'}
                        <button 
                          type="button" 
                          className="ml-1 text-blue-600 hover:text-blue-800"
                          onClick={() => {
                            const newDays = [...(formData.date_range?.days || [])];
                            newDays.splice(newDays.indexOf(day), 1);
                            setFormData({
                              ...formData,
                              date_range: {
                                ...formData.date_range || { days: [] },
                                days: newDays
                              }
                            });
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="relative mt-2">
                    <select
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      onChange={(e) => {
                        if (e.target.value) {
                          const selectedDay = e.target.value;
                          const currentDays = [...(formData.date_range?.days || [])];
                          
                          // Kiểm tra nếu ngày đã được chọn trước đó
                          if (!currentDays.includes(selectedDay)) {
                            const updatedDateRange = {
                              ...formData.date_range || { days: [] },
                              days: [...currentDays, selectedDay]
                            };
                            
                            console.log('Selecting day:', selectedDay);
                            console.log('Current days:', currentDays);
                            console.log('Updated date range:', updatedDateRange);
                            
                            setFormData({
                              ...formData,
                              date_range: updatedDateRange
                            });
                          }
                          
                          // Reset giá trị của select về giá trị rỗng
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="">Chọn ngày...</option>
                      {!formData.date_range?.days?.includes('mon') && <option value="mon">Thứ Hai</option>}
                      {!formData.date_range?.days?.includes('tue') && <option value="tue">Thứ Ba</option>}
                      {!formData.date_range?.days?.includes('wed') && <option value="wed">Thứ Tư</option>}
                      {!formData.date_range?.days?.includes('thu') && <option value="thu">Thứ Năm</option>}
                      {!formData.date_range?.days?.includes('fri') && <option value="fri">Thứ Sáu</option>}
                      {!formData.date_range?.days?.includes('sat') && <option value="sat">Thứ Bảy</option>}
                      {!formData.date_range?.days?.includes('sun') && <option value="sun">Chủ Nhật</option>}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tệp đính kèm */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Hình ảnh dịch vụ</label>
                <Dropzone
                  value={formData.image_urls || []}
                  onChange={(urls) => setFormData({...formData, image_urls: urls})}
                  maxFiles={5}
                />
              </div>

              {/* Ghi chú */}
              <div>
                <label htmlFor="note" className="block text-sm font-medium text-gray-700">Ghi chú cho admin</label>
                <textarea
                  id="note"
                  name="note"
                  value={formData.note || ''}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Trạng thái */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">Trạng thái</label>
                  <input
                    type="text"
                    id="status"
                    name="status"
                    value="Chờ duyệt"
                    disabled={true}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">Dịch vụ sẽ được kiểm duyệt trước khi hiển thị công khai</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
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
                      Đang lưu...
                    </>
                  ) : isEditing ? "Cập nhật" : "Tạo dịch vụ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCreateForm; 