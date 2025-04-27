import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDemandApplicationById } from '../services/demand_application.service';

const statusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-orange-100 text-orange-700 border border-orange-300';
    case 'approved': return 'bg-green-100 text-green-700 border border-green-300';
    case 'rejected': return 'bg-red-100 text-red-700 border border-red-300';
    default: return 'bg-gray-100 text-gray-700 border border-gray-300';
  }
};

const MyApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalImage, setModalImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!id) return;
        const data = await getDemandApplicationById(id);
        setApplication(data);
      } catch (err) {
        setError('Không thể tải chi tiết đơn ứng tuyển.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-orange-600 font-semibold">Đang tải...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!application) return <div className="p-8 text-center">Không tìm thấy đơn ứng tuyển.</div>;

  return (
    <div className="max-w-2xl mx-auto py-12 px-2 sm:px-6 lg:px-8 pt-24">
      <h2 className="text-3xl font-bold mb-6 text-orange-600 text-center">Chi tiết đơn ứng tuyển</h2>
      <div className="bg-white shadow-lg rounded-xl p-8 mb-8 border border-orange-100">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-800">Tên nhu cầu:</span>
          <span className="text-base text-gray-700 font-medium">{application.demand_title || application.demand_id}</span>
        </div>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-800">Trạng thái:</span>
          <span className={`px-4 py-1 rounded-full text-sm font-semibold ${statusColor(application.status)}`}>
            {application.status === 'pending' ? 'Chờ duyệt' : application.status === 'approved' ? 'Đã duyệt' : application.status === 'rejected' ? 'Từ chối' : application.status}
          </span>
        </div>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-800">Ngày ứng tuyển:</span>
          <span className="text-base text-gray-700">{new Date(application.created_at).toLocaleString()}</span>
        </div>
        <div className="mb-4">
          <span className="text-lg font-semibold text-gray-800 block mb-1">Thông tin liên hệ:</span>
          {application.contact_info && (application.contact_info.email || application.contact_info.phone || application.contact_info.address) ? (
            <ul className="list-disc ml-6 text-gray-700">
              {application.contact_info.email && <li>Email: {application.contact_info.email}</li>}
              {application.contact_info.phone && <li>Điện thoại: {application.contact_info.phone}</li>}
              {application.contact_info.address && <li>Địa chỉ: {application.contact_info.address}</li>}
            </ul>
          ) : <span className="text-gray-400">Không có</span>}
        </div>
        <div className="mb-4">
          <span className="text-lg font-semibold text-gray-800 block mb-1">Chương trình khuyến mãi:</span>
          <span className="text-gray-700">{application.promote_text || <span className="text-gray-400">Không có</span>}</span>
        </div>
        <div className="mb-4">
          <span className="text-lg font-semibold text-gray-800 block mb-1">Ghi chú:</span>
          <span className="text-gray-700">{application.note || <span className="text-gray-400">Không có</span>}</span>
        </div>
        <div className="mb-4">
          <span className="text-lg font-semibold text-gray-100 block mb-1">Hình ảnh:</span>
          {application.image_urls && application.image_urls.length > 0 ? (
            <div className="flex flex-wrap gap-3 mt-2">
              {application.image_urls.map((url: string, idx: number) => (
                <img
                  key={idx}
                  src={url}
                  alt="Hình minh họa"
                  className="w-28 h-28 object-cover rounded-lg border border-orange-200 shadow cursor-pointer hover:scale-105 transition"
                  onClick={() => setModalImage(url)}
                />
              ))}
            </div>
          ) : <span className="text-gray-400">Không có</span>}
        </div>
      </div>
      <div className="flex justify-center">
        <button onClick={() => navigate('/my-applications')} className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 shadow transition">Quay lại danh sách</button>
      </div>

      {/* Modal hiển thị ảnh lớn */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-60 transition-opacity duration-300 animate-fadein"
          style={{ backdropFilter: 'blur(2px)' }}
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative transition-transform duration-300 transform animate-zoomIn"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={modalImage}
              alt="Xem lớn"
              className="max-w-[90vw] max-h-[80vh] rounded-lg border-4 border-orange-200 shadow-2xl transition-all duration-300"
            />
            <button
              className="absolute top-2 right-2 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-orange-600 shadow-lg text-2xl transition"
              onClick={() => setModalImage(null)}
              aria-label="Đóng"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplicationDetail; 