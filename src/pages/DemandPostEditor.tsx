import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { createDemand, updateDemand, getDemandById, IDemandInput, createDemandApplication, IDemandApplicationInput } from '../services/demand.service';
import RichtextEditor from '../components/RichtextEditorComponent';
import Dropzone from '../components/Dropzone';

// Thêm hàm formatDay
const formatDay = (day?: string) => {
  const days: Record<string, string> = {
    'mon': 'Thứ 2',
    'tue': 'Thứ 3', 
    'wed': 'Thứ 4',
    'thu': 'Thứ 5',
    'fri': 'Thứ 6',
    'sat': 'Thứ 7',
    'sun': 'CN'
  };
  return day ? days[day] || day : '';
};

// Thêm interface cho đơn ứng tuyển
interface IDemandApplication {
  applicant_name: string;
  demand_title: string;
  contact_info: {
    address: string;
    phone: string;
    email: string;
  };
  promotional_program?: string;
  image_urls?: string[];
  admin_notes?: string;
}

// Thêm interface cho contact
interface IContact {
  platform: string;
  value: string;
}

const DemandPostEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isApplicationMode, setIsApplicationMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState<IDemandInput>({
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
    status: 'pending',
    is_public: true,
    item_type: 'demand',
    contact_info: {
      email: '',
      phone: '',
      address: ''
    },
    note: ''
  });

  // State for attachments
  const [attachments, setAttachments] = useState<string[]>([]);

  // Form data cho đơn ứng tuyển
  const [applicationData, setApplicationData] = useState<IDemandApplication>({
    applicant_name: '',
    demand_title: '',
    contact_info: {
      address: '',
      phone: '',
      email: ''
    },
    promotional_program: '',
    image_urls: [],
    admin_notes: ''
  });

  // Thêm state cho platformOptions
  const [platformOptions] = useState<string[]>(['phone', 'email', 'facebook']);
  const [] = useState('');

  // Thêm state cho lỗi giá
  const [priceError, setPriceError] = useState<{min?: string, max?: string}>({});

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      if (id) {
        setIsEditing(true);
        await loadDemandData();
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [id, isAuthenticated, navigate]);

  const loadDemandData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const demandData = await getDemandById(id);
      
      if (!demandData) {
        setError('Không tìm thấy thông tin nhu cầu');
        setLoading(false);
        return;
      }

      // Kiểm tra quyền chỉnh sửa
      if (user?.id !== demandData.owner_id) {
        setError('Bạn không có quyền chỉnh sửa nhu cầu này');
        setLoading(false);
        return;
      }

      // Cập nhật form data từ demand đã tồn tại
      setFormData({
        title: demandData.title,
        description: demandData.description,
        category: demandData.category,
        price_range: demandData.price_range || {
          min: 0,
          max: 0,
          currency: 'VND'
        },
        date_range: demandData.date_range || {
          days: []
        },
        status: demandData.status,
        is_public: demandData.is_public !== undefined ? demandData.is_public : true,
        item_type: 'demand',
        contact_info: demandData.contact_info || {
          email: '',
          phone: '',
          address: ''
        },
        note: demandData.note || ''
      });

      if (demandData.image_urls) {
        setAttachments(demandData.image_urls);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading demand data:', err);
      setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Xử lý trường lồng nhau (nested fields)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof IDemandInput],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    // Kiểm tra lỗi giá
    if (name === 'price_range.min' || name === 'price_range.max') {
      const min = Number(name === 'price_range.min' ? value : formData.price_range.min);
      const max = Number(name === 'price_range.max' ? value : formData.price_range.max);
      let err: {min?: string, max?: string} = {};
      if (isNaN(min) || min < 0) err.min = 'Giá tối thiểu phải là số không âm';
      if (isNaN(max) || max < 0) err.max = 'Giá tối đa phải là số không âm';
      if (!err.min && !err.max && min > max) {
        err.min = 'Giá tối thiểu không thể lớn hơn giá tối đa';
        err.max = 'Giá tối đa không thể nhỏ hơn giá tối thiểu';
      }
      setPriceError(err);
    }
  };

  // Thêm hàm xử lý ngày trong tuần tương tự ServicePostEditor
  const handleDayAdd = (selectedDay: string) => {
    if (selectedDay) {
      const currentDays = [...(formData.date_range?.days || [])];
      
      // Kiểm tra nếu ngày đã được chọn trước đó
      if (!currentDays.includes(selectedDay)) {
        setFormData({
          ...formData,
          date_range: {
            ...formData.date_range || { days: [] },
            days: [...currentDays, selectedDay]
          }
        });
      }
    }
  };

  const handleDayRemove = (dayToRemove: string) => {
    const newDays = [...(formData.date_range?.days || [])];
    newDays.splice(newDays.indexOf(dayToRemove), 1);
    setFormData({
      ...formData,
      date_range: {
        ...formData.date_range || { days: [] },
        days: newDays
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Nếu có lỗi giá thì không submit
    if (priceError.min || priceError.max) return;
    
    try {
      // Kiểm tra validation
      if (!formData.title.trim()) {
        setError('Vui lòng nhập tiêu đề nhu cầu');
        return;
      }
      
      if (!formData.description.trim()) {
        setError('Vui lòng nhập mô tả nhu cầu');
        return;
      }
      
      if (!formData.category.trim()) {
        setError('Vui lòng chọn danh mục nhu cầu');
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

      // Loại bỏ trường location khỏi dữ liệu gửi đi nếu có
      const { location, ...demandDataWithoutLocation } = formData as any;

      // Chuẩn bị dữ liệu demand theo cấu trúc mới
      const demandData = {
        ...demandDataWithoutLocation,
        price_range: priceRange,
        status: 'pending', // Đảm bảo trạng thái luôn là pending
        item_type: 'demand',
        image_urls: attachments, // Thêm hình ảnh từ biến state attachments
        note: formData.note
      };

      if (isEditing && id) {
        try {
          // Cập nhật nhu cầu
          await updateDemand(id, demandData);
          navigate(`/demands/${id}`);
        } catch (updateError: any) {
          console.error('Error updating demand:', updateError);
          setError(`Lỗi khi cập nhật: ${updateError.message || 'Không xác định'}`);
        }
      } else {
        try {
          // Tạo nhu cầu mới
          const result = await createDemand(demandData);
          if (result?.id) {
            console.log('Demand created successfully:', result);
            navigate('/my-demands'); // Chuyển về trang Nhu cầu của tôi
          } else {
            setError('Không thể tạo nhu cầu. Phản hồi từ server không hợp lệ.');
          }
        } catch (createError: any) {
          console.error('Error creating demand:', createError);
          setError(`Lỗi khi tạo: ${createError.message || 'Không xác định'}`);
        }
      }

      setSaving(false);
    } catch (err: any) {
      console.error('Error saving demand:', err);
      setError(`Đã xảy ra lỗi khi lưu nhu cầu: ${err.message || 'Vui lòng thử lại sau.'}`);
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isEditing && id) {
      navigate(`/demands/${id}`);
    } else {
      navigate('/services');
    }
  };

  // Bổ sung xử lý cho đơn ứng tuyển
  const handleApplicationInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Xử lý các trường lồng nhau
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setApplicationData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof IDemandApplication] as any,
          [child]: value
        }
      }));
    } else {
      setApplicationData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Xử lý upload ảnh cho đơn ứng tuyển
  const handleApplicationImagesChange = (urls: string[]) => {
    setApplicationData(prev => ({
      ...prev,
      image_urls: urls
    }));
  };

  // Thêm hàm gửi đơn ứng tuyển
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Xác thực các trường bắt buộc
      if (!applicationData.applicant_name || !applicationData.demand_title) {
        setError('Vui lòng điền đầy đủ thông tin người ứng tuyển và tiêu đề công việc');
        setSaving(false);
        return;
      }

      if (!applicationData.contact_info.email || !applicationData.contact_info.phone || !applicationData.contact_info.address) {
        setError('Vui lòng điền đầy đủ thông tin liên hệ');
        setSaving(false);
        return;
      }

      // Chuẩn bị dữ liệu đơn ứng tuyển
      const applicationInput: IDemandApplicationInput = {
        demand_id: id as string,
        contact_info: applicationData.contact_info,
        promote_text: applicationData.promotional_program,
        image_urls: applicationData.image_urls || [],
        note: applicationData.admin_notes,
        status: 'pending'
      };

      // Gửi đơn ứng tuyển qua Supabase
      const result = await createDemandApplication(applicationInput);
      
      if (!result) {
        setError('Có lỗi xảy ra khi gửi đơn ứng tuyển. Vui lòng thử lại sau.');
        setSaving(false);
        return;
      }
      
      // Sau khi gửi thành công, chuyển về trang chi tiết của demand
      navigate(`/demands/${id}`);
    } catch (err: any) {
      console.error('Lỗi khi gửi đơn ứng tuyển:', err);
      setError(err.message || 'Có lỗi xảy ra khi gửi đơn ứng tuyển');
    } finally {
      setSaving(false);
    }
  };

  // Thêm hàm xử lý thêm nền tảng mới

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

  // Thêm UI cho chế độ ứng tuyển
  if (isApplicationMode) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Ứng tuyển công việc</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmitApplication} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="applicant_name">
                Tên người ứng tuyển
              </label>
              <input
                id="applicant_name"
                name="applicant_name"
                type="text"
                value={applicationData.applicant_name}
                onChange={handleApplicationInputChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="demand_title">
                Tiêu đề công việc
              </label>
              <input
                id="demand_title"
                name="demand_title"
                type="text"
                value={applicationData.demand_title}
                onChange={handleApplicationInputChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="contact_info.email">
                Email
              </label>
              <input
                id="contact_info.email"
                name="contact_info.email"
                type="email"
                value={applicationData.contact_info.email}
                onChange={handleApplicationInputChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="contact_info.phone">
                Số điện thoại
              </label>
              <input
                id="contact_info.phone"
                name="contact_info.phone"
                type="text"
                value={applicationData.contact_info.phone}
                onChange={handleApplicationInputChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="contact_info.address">
                Địa chỉ
              </label>
              <input
                id="contact_info.address"
                name="contact_info.address"
                type="text"
                value={applicationData.contact_info.address}
                onChange={handleApplicationInputChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="promotional_program">
              Chương trình khuyến mãi
            </label>
            <input
              id="promotional_program"
              name="promotional_program"
              type="text"
              value={applicationData.promotional_program || ''}
              onChange={handleApplicationInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="admin_notes">
              Ghi chú
            </label>
            <textarea
              id="admin_notes"
              name="admin_notes"
              value={applicationData.admin_notes || ''}
              onChange={handleApplicationInputChange}
              className="w-full p-2 border rounded h-32"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">
              Hình ảnh
            </label>
            <Dropzone
              value={applicationData.image_urls || []}
              onChange={handleApplicationImagesChange}
              maxFiles={5}
            />
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setIsApplicationMode(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Quay lại
            </button>
            
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {saving ? 'Đang gửi...' : 'Gửi đơn ứng tuyển'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-orange-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {isEditing ? "Chỉnh sửa nhu cầu" : "Đăng nhu cầu mới"}
                </h2>
                {isEditing && (
                  <p className="mt-1 text-orange-100">
                    Chỉnh sửa thông tin nhu cầu của bạn
                  </p>
                )}
              </div>
              <button
                onClick={handleCancel}
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
            {/* Thông tin cơ bản */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Thông tin cơ bản</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    placeholder="Nhập tiêu đề nhu cầu của bạn"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Mô tả chi tiết <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <RichtextEditor
                      markdown={formData.description}
                      onChange={(value) => setFormData({...formData, description: value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Danh mục <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      required
                      placeholder="Nhập danh mục..."
                      value={formData.category}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Ngân sách và thời gian */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Ngân sách và thời gian</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="price_range.min" className="block text-sm font-medium text-gray-700">
                      Ngân sách tối thiểu
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        id="price_range.min"
                        name="price_range.min"
                        value={formData.price_range.min || ''}
                        onChange={handleInputChange}
                        min="0"
                        className={`block w-full border rounded-md pl-3 pr-12 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${priceError.min ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">VND</span>
                      </div>
                    </div>
                    {priceError.min && <p className="text-red-500 text-xs mt-1">{priceError.min}</p>}
                  </div>

                  <div>
                    <label htmlFor="price_range.max" className="block text-sm font-medium text-gray-700">
                      Ngân sách tối đa <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        id="price_range.max"
                        name="price_range.max"
                        required
                        value={formData.price_range.max}
                        onChange={handleInputChange}
                        min="0"
                        className={`block w-full border rounded-md pl-3 pr-12 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${priceError.max ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">VND</span>
                      </div>
                    </div>
                    {priceError.max && <p className="text-red-500 text-xs mt-1">{priceError.max}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày làm việc trong tuần
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => {
                      const isSelected = formData.date_range?.days?.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => isSelected ? handleDayRemove(day) : handleDayAdd(day)}
                          className={`p-2 text-sm font-medium rounded-md ${
                            isSelected
                              ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {formatDay(day)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin liên hệ */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Thông tin liên hệ</h3>
              <div className="space-y-4">
                {formData.contact_info?.contacts?.map((contact: IContact, index: number) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-1">
                      <select
                        value={contact.platform}
                        onChange={(e) => {
                          const newContacts = [...(formData.contact_info?.contacts || [])];
                          newContacts[index] = { ...contact, platform: e.target.value };
                          setFormData({
                            ...formData,
                            contact_info: {
                              ...formData.contact_info,
                              contacts: newContacts
                            }
                          });
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      >
                        <option value="">Chọn nền tảng</option>
                        {platformOptions.map(platform => (
                          <option key={platform} value={platform}>
                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={contact.value}
                        onChange={(e) => {
                          const newContacts = [...(formData.contact_info?.contacts || [])];
                          newContacts[index] = { ...contact, value: e.target.value };
                          setFormData({
                            ...formData,
                            contact_info: {
                              ...formData.contact_info,
                              contacts: newContacts
                            }
                          });
                        }}
                        placeholder="Thông tin liên hệ"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newContacts = [...(formData.contact_info?.contacts || [])];
                        newContacts.splice(index, 1);
                        setFormData({
                          ...formData,
                          contact_info: {
                            ...formData.contact_info,
                            contacts: newContacts
                          }
                        });
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    const newContacts = [...(formData.contact_info?.contacts || [])];
                    newContacts.push({ platform: '', value: '' });
                    setFormData({
                      ...formData,
                      contact_info: {
                        ...formData.contact_info,
                        contacts: newContacts
                      }
                    });
                  }}
                  className="mt-2 inline-flex items-center px-3 py-1.5 border border-orange-600 rounded-md text-sm font-medium text-orange-600 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Thêm liên hệ
                </button>
              </div>
            </div>

            {/* Hình ảnh và ghi chú */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Hình ảnh và ghi chú</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hình ảnh minh họa
                  </label>
                  <Dropzone
                    value={attachments}
                    onChange={(urls) => {
                      setAttachments(urls);
                      setFormData({
                        ...formData,
                        image_urls: urls
                      });
                    }}
                    maxFiles={5}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Tải lên tối đa 5 hình ảnh minh họa cho nhu cầu của bạn
                  </p>
                </div>

                <div>
                  <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                    Ghi chú
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    value={formData.note || ''}
                    onChange={handleInputChange}
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    placeholder="Nhập ghi chú thêm về nhu cầu của bạn..."
                  />
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
                disabled={saving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang lưu...
                  </span>
                ) : isEditing ? "Cập nhật" : "Tạo nhu cầu"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DemandPostEditor; 