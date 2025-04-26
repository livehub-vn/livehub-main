import React, { useEffect, useState } from 'react';
import { getDemands, IDemand } from '../services/demand.service';
import { Link } from 'react-router-dom';

const ApprovedDemands: React.FC = () => {
  const [demands, setDemands] = useState<IDemand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApprovedDemands = async () => {
      try {
        setLoading(true);
        const response = await getDemands(1, 20, { status: 'approved' });
        setDemands(response.data);
        setLoading(false);
      } catch (err) {
        setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    fetchApprovedDemands();
  }, []);

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-gray-50">Đang tải...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen bg-gray-50">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-xl font-bold mb-4">Danh sách nhu cầu đã duyệt</h2>
      <ul className="divide-y divide-gray-200">
        {demands.length === 0 && <li className="text-gray-500">Không có nhu cầu nào đã duyệt.</li>}
        {demands.map(demand => (
          <li key={demand.id} className="py-4">
            <Link to={`/demands/${demand.id}`} className="text-blue-600 hover:underline font-medium">{demand.title}</Link>
            <div className="text-sm text-gray-500">{demand.category}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ApprovedDemands; 