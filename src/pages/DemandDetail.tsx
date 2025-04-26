import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getDemandById, changeDemandStatus, IDemand } from '../services/demand.service';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const DemandDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [demand, setDemand] = useState<IDemand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [changingStatus, setChangingStatus] = useState(false);
  const [applicantsCount, setApplicantsCount] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/demands');
      return;
    }

    loadDemandData();
  }, [id, navigate]);

  const loadDemandData = async () => {
    try {
      setLoading(true);
      const demandData = await getDemandById(id!);
      setDemand(demandData);
      // Giả định số lượng ứng tuyển, có thể cập nhật từ API thực tế nếu có
      setApplicantsCount(0);
      setLoading(false);
    } catch (err) {
      console.error('Error loading demand data:', err);
      setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'open' | 'closed' | 'awarded' | 'completed') => {
    if (!id || !demand) return;

    try {
      setChangingStatus(true);
      await changeDemandStatus(id, newStatus);
      // Cập nhật lại thông tin demand
      await loadDemandData();
      setChangingStatus(false);
    } catch (err) {
      console.error('Error changing demand status:', err);
      setError('Đã xảy ra lỗi khi thay đổi trạng thái. Vui lòng thử lại sau.');
      setChangingStatus(false);
    }
  };

  const isOwner = user && demand && user.id === demand.owner_id;

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
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <svg className="mx-auto h-12 w-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Không tìm thấy</h3>
          <p className="mt-2 text-gray-600">Không tìm thấy nhu cầu này hoặc nó đã bị xóa.</p>
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

  if (demand && demand.status !== 'approved') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <svg className="mx-auto h-12 w-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Nhu cầu chưa được duyệt</h3>
          <p className="mt-2 text-gray-600">Nhu cầu này chưa được duyệt hoặc đã bị ẩn khỏi hệ thống.</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/demands')}
          className="mb-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          ← Quay lại danh sách nhu cầu
        </button>
      </div>
      {/* Modal cảnh báo cho buyer */}
      {showModal && (
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
      )}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 truncate">{demand.title}</h1>
                <div className="mt-1 flex flex-wrap items-center text-sm text-gray-500">
                  <span className="mr-3">
                    Đăng ngày: {format(new Date(demand.created_at), 'dd/MM/yyyy', { locale: vi })}
                  </span>
                  <span className="mr-3">
                    Danh mục: {demand.category}
                    {demand.subcategory && ` / ${demand.subcategory}`}
                  </span>
                  <span className="mr-3">
                    Lượt ứng tuyển: {applicantsCount}
                  </span>
                </div>
              </div>

              <div className="flex mt-4 md:mt-0 space-x-3">
                {isAuthenticated && !isOwner && demand.status === 'open' && (
                  <Link
                    to={`/demands/${id}/apply`}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Ứng tuyển
                  </Link>
                )}

                {isOwner && (
                  <>
                    <Link
                      to={`/demands/${id}/edit`}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Chỉnh sửa
                    </Link>
                    
                    {demand.status === 'draft' && (
                      <button
                        onClick={() => handleStatusChange('open')}
                        disabled={changingStatus}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        {changingStatus ? 'Đang xử lý...' : 'Công khai nhu cầu'}
                      </button>
                    )}
                    
                    {demand.status === 'open' && (
                      <button
                        onClick={() => handleStatusChange('closed')}
                        disabled={changingStatus}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        {changingStatus ? 'Đang xử lý...' : 'Đóng nhu cầu'}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {demand.tags && demand.tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {tag}
                </span>
              ))}

              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                demand.status === 'open' ? 'bg-green-100 text-green-800' :
                demand.status === 'closed' ? 'bg-red-100 text-red-800' :
                demand.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                demand.status === 'awarded' ? 'bg-yellow-100 text-yellow-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {demand.status === 'open' ? 'Đang mở' :
                 demand.status === 'closed' ? 'Đã đóng' :
                 demand.status === 'draft' ? 'Bản nháp' :
                 demand.status === 'awarded' ? 'Đã giao' :
                 'Hoàn thành'}
              </span>
            </div>
          </div>

          {/* Thông tin chi tiết */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            <div className="md:col-span-2">
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Mô tả chi tiết</h2>
                <div className="prose max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {demand.description}
                  </ReactMarkdown>
                </div>
              </div>

              {demand.attachments && demand.attachments.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Tệp đính kèm</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {demand.attachments.map((url, index) => (
                      <a 
                        key={index} 
                        href={url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex flex-col items-center">
                          <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="mt-2 text-sm text-gray-500 truncate w-full text-center">Tệp {index + 1}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-1">
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 divide-y divide-gray-200">
                <div className="pb-4">
                  <h3 className="text-base font-medium text-gray-900 mb-2">Ngân sách</h3>
                  <div className="text-lg font-bold text-gray-900">
                    {demand.price_range.min && `${demand.price_range.min.toLocaleString()} - `}
                    {demand.price_range.max.toLocaleString()} {demand.price_range.currency}
                  </div>
                </div>

                <div className="py-4">
                  <h3 className="text-base font-medium text-gray-900 mb-2">Thời gian</h3>
                  {demand.date_range?.start && (
                    <div className="text-sm text-gray-700 mb-1">
                      <span className="font-medium">Ngày bắt đầu:</span> {format(new Date(demand.date_range.start), 'dd/MM/yyyy', { locale: vi })}
                    </div>
                  )}
                  {demand.date_range?.end && (
                    <div className="text-sm text-gray-700 mb-1">
                      <span className="font-medium">Ngày kết thúc:</span> {format(new Date(demand.date_range.end), 'dd/MM/yyyy', { locale: vi })}
                    </div>
                  )}
                  {demand.date_range?.days && demand.date_range.days.length > 0 && (
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Ngày làm việc:</span> {demand.date_range.days.map(day => {
                        if (day === 'mon') return 'Thứ 2';
                        if (day === 'tue') return 'Thứ 3';
                        if (day === 'wed') return 'Thứ 4';
                        if (day === 'thu') return 'Thứ 5';
                        if (day === 'fri') return 'Thứ 6';
                        if (day === 'sat') return 'Thứ 7';
                        if (day === 'sun') return 'Chủ Nhật';
                        return day;
                      }).join(', ')}
                    </div>
                  )}
                </div>

                <div className="py-4">
                  <h3 className="text-base font-medium text-gray-900 mb-2">Thông tin chung</h3>
                  <div className="text-sm text-gray-700 mb-1">
                    <span className="font-medium">Địa điểm làm việc:</span>{' '}
                    {demand.location === 'remote' ? 'Từ xa' : 
                    demand.location === 'onsite' ? 'Tại văn phòng' : 'Kết hợp'}
                  </div>
                  {demand.location_details && (
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Chi tiết địa điểm:</span> {demand.location_details}
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <h3 className="text-base font-medium text-gray-900 mb-2">Thống kê</h3>
                  <div className="text-sm text-gray-700 mb-1">
                    <span className="font-medium">Đăng ngày:</span> {format(new Date(demand.created_at), 'dd/MM/yyyy', { locale: vi })}
                  </div>
                  <div className="text-sm text-gray-700 mb-1">
                    <span className="font-medium">Cập nhật:</span> {format(new Date(demand.updated_at), 'dd/MM/yyyy', { locale: vi })}
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">ID:</span> {demand.id}
                  </div>
                </div>
              </div>

              {isAuthenticated && user?.metadata.role === 'SUPPLIER' && demand.status === 'approved' && (
                <div className="mt-6">
                  <button
                    className="w-full px-6 py-3 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    onClick={() => navigate(`/demands/${id}/apply`)}
                  >
                    Ứng tuyển vào nhu cầu này
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandDetail; 