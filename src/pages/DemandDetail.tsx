import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getDemandById, IDemand } from '../services/demand.service';
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
  const [] = useState(false);
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
    if (!isOwner) {
      navigate('/demands');
      return null;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden p-6 flex flex-col md:flex-row gap-8">
          {/* Ảnh lớn bên trái */}
          <div className="md:w-1/2 flex flex-col items-center justify-start">
            {demand.image_urls && demand.image_urls.length > 0 ? (
              <img
                src={demand.image_urls[0]}
                alt="Ảnh chính"
                className="w-[400px] h-[400px] object-cover rounded-lg border border-gray-200 shadow mb-4"
              />
            ) : (
              <div className="w-[400px] h-[400px] bg-gray-100 flex items-center justify-center rounded-lg border mb-4 text-gray-400">Không có ảnh</div>
            )}
            {/* Gallery nhỏ */}
            {demand.image_urls && demand.image_urls.length > 1 && (
              <div className="flex gap-2 mt-2">
                {demand.image_urls.slice(1, 5).map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Ảnh phụ ${idx + 2}`}
                    className="w-20 h-20 object-cover rounded border cursor-pointer hover:ring-2 hover:ring-orange-500"
                    onClick={() => window.open(url, '_blank')}
                  />
                ))}
              </div>
            )}
          </div>
          {/* Thông tin chính bên phải */}
          <div className="md:w-1/2 flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{demand.title}</h1>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg font-bold text-orange-600">
                {demand.price_range.min?.toLocaleString()} - {demand.price_range.max?.toLocaleString()} {demand.price_range.currency}
              </span>
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
            <div className="flex flex-wrap gap-2 mb-2">
              {demand.tags && demand.tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {tag}
                </span>
              ))}
            </div>
            <div className="text-sm text-gray-500 mb-2">
              <span className="mr-3">Đăng ngày: {format(new Date(demand.created_at), 'dd/MM/yyyy', { locale: vi })}</span>
              <span className="mr-3">Danh mục: {demand.category}{demand.subcategory && ` / ${demand.subcategory}`}</span>
              <span className="mr-3">Lượt ứng tuyển: {applicantsCount}</span>
            </div>
            {/* Ưu đãi/ghi chú nếu có */}
            {demand.note && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-yellow-800 text-sm rounded mb-2">
                <span className="font-semibold">Ghi chú:</span> {demand.note}
              </div>
            )}
            {/* Nút hành động */}
            <div className="flex gap-3 mt-2">
              {isOwner && (
                <Link
                  to={`/demands/${id}/edit`}
                  className="px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Chỉnh sửa
                </Link>
              )}
              {!isOwner && isAuthenticated && user?.metadata?.role === 'BUYER' && demand.status === 'open' && (
                <Link
                  to={`/service-rentals/create?demandId=${id}`}
                  className="px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Thuê dịch vụ
                </Link>
              )}
            </div>
            {/* Thông tin thời gian, địa điểm */}
            <div className="mt-4 text-sm text-gray-700">
              {demand.date_range?.start && (
                <div><span className="font-medium">Ngày bắt đầu:</span> {format(new Date(demand.date_range.start), 'dd/MM/yyyy', { locale: vi })}</div>
              )}
              {demand.date_range?.end && (
                <div><span className="font-medium">Ngày kết thúc:</span> {format(new Date(demand.date_range.end), 'dd/MM/yyyy', { locale: vi })}</div>
              )}
              {demand.date_range?.days && demand.date_range.days.length > 0 && (
                <div><span className="font-medium">Ngày làm việc:</span> {demand.date_range.days.map(day => {
                  if (day === 'mon') return 'Thứ 2';
                  if (day === 'tue') return 'Thứ 3';
                  if (day === 'wed') return 'Thứ 4';
                  if (day === 'thu') return 'Thứ 5';
                  if (day === 'fri') return 'Thứ 6';
                  if (day === 'sat') return 'Thứ 7';
                  if (day === 'sun') return 'Chủ Nhật';
                  return day;
                }).join(', ')}</div>
              )}
              <div><span className="font-medium">Địa điểm làm việc:</span> {demand.location === 'remote' ? 'Từ xa' : demand.location === 'onsite' ? 'Tại văn phòng' : 'Kết hợp'}</div>
              {demand.location_details && (
                <div><span className="font-medium">Chi tiết địa điểm:</span> {demand.location_details}</div>
              )}
            {/* Nút đăng ký ứng tuyển luôn hiển thị cho supplier (không phải owner, đã đăng nhập) */}
            {!isOwner && isAuthenticated && user?.metadata?.role === 'SUPPLIER' && (
              <div className="flex justify-end mt-6">
                <Link
                  to={`/demands/${id}/apply`}
                  className="px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
                >
                  Đăng ký ứng tuyển
                </Link>
              </div>
            )}
            </div>
          </div>
        </div>
        {/* Mô tả và file đính kèm bên dưới */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mt-8 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Mô tả chi tiết</h2>
          <div className="prose max-w-none mb-8">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {demand.description}
            </ReactMarkdown>
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
      </div>
    </div>
  );
};

export default DemandDetail; 