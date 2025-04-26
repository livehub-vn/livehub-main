import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDemands, IDemand, IDemandFilter } from '../services/demand.service';
import { useAuthStore } from '../stores/authStore';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const Demands: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [demands, setDemands] = useState<IDemand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  // Các state cho bộ lọc
  const [filter, setFilter] = useState<IDemandFilter>({ is_public: true, status: 'approved' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDemands();
  }, [page, filter]);

  const loadDemands = async () => {
    try {
      setLoading(true);
      let filterWithSearch: any = { is_public: true, status: 'approved' };
      if (searchTerm) filterWithSearch.search = searchTerm;
      if (filter.category) filterWithSearch.category = filter.category;
      // Có thể mở rộng thêm các trường khác nếu cần
      console.log('Đang tải dữ liệu với filter:', filterWithSearch);
      
      const response = await getDemands(page, limit, filterWithSearch);
      console.log('Dữ liệu nhận được:', response);
      
      if (response.data) {
        setDemands(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalItems);
      } else {
        setError('Không thể tải dữ liệu nhu cầu');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading demands:', err);
      setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Tìm kiếm với từ khóa:', searchTerm);
    setPage(1);
    loadDemands();
  };

  const clearFilters = () => {
    setFilter({ is_public: true, status: 'approved' });
    setSearchTerm('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Danh sách nhu cầu</h1>
            <p className="mt-2 text-gray-600">Tìm kiếm các nhu cầu từ khách hàng</p>
          </div>
          
          {isAuthenticated && (
            <Link
              to="/demands/new"
              className="mt-4 md:mt-0 px-4 py-2 bg-[#FF9800] text-white rounded-md hover:bg-[#FFA726] focus:outline-none focus:ring-2 focus:ring-[#FF9800]"
            >
              Đăng nhu cầu mới
            </Link>
          )}
        </div>

        {/* Bộ lọc và tìm kiếm - đã đơn giản hóa */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="text"
                    id="searchTerm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm theo tiêu đề, mô tả..."
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-400 focus:ring-gray-400 sm:text-sm"
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 flex items-center px-3 bg-[#FF9800] text-white rounded-r-md hover:bg-[#FFA726]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 mr-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Xóa bộ lọc
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#FF9800] hover:bg-[#FFA726] focus:outline-none focus:ring-2 focus:ring-[#FF9800]"
              >
                Áp dụng
              </button>
            </div>
          </form>
        </div>

        {/* Kết quả */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Lỗi</h3>
              <p className="mt-2 text-gray-600">{error}</p>
              <button
                onClick={() => loadDemands()}
                className="mt-4 px-4 py-2 bg-[#FF9800] text-white rounded-md hover:bg-[#FFA726] focus:outline-none focus:ring-2 focus:ring-[#FF9800]"
              >
                Thử lại
              </button>
            </div>
          </div>
        ) : demands.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Không tìm thấy kết quả</h3>
              <p className="mt-2 text-gray-600">Không có nhu cầu nào phù hợp với tiêu chí tìm kiếm của bạn.</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-[#FF9800] text-white rounded-md hover:bg-[#FFA726] focus:outline-none focus:ring-2 focus:ring-[#FF9800]"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              Hiển thị {demands.length} trong số {totalItems} kết quả
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <ul className="divide-y divide-gray-200">
                {demands.map((demand) => (
                  <li key={demand.id} className="hover:bg-gray-50">
                    <Link to={`/demands/${demand.id}`} className="block">
                      <div className="px-6 py-5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-[#FF9800] truncate">{demand.title}</h3>
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-500 line-clamp-2">{demand.description}</div>
                        
                        <div className="mt-3 flex flex-wrap items-center text-xs text-gray-500">
                          <span className="mr-4">
                            <span className="font-medium">Danh mục:</span> {demand.category}
                          </span>
                          
                          {demand.price_range && (
                            <span className="mr-4">
                              <span className="font-medium">Ngân sách:</span> {demand.price_range.min && `${demand.price_range.min.toLocaleString()} - `}
                              {demand.price_range.max && `${demand.price_range.max.toLocaleString()} ${demand.price_range.currency || 'VND'}`}
                            </span>
                          )}

                          {demand.date_range?.days && demand.date_range.days.length > 0 && (
                            <span className="mr-4">
                              <span className="font-medium">Ngày làm việc:</span> {demand.date_range.days.map(day => {
                                switch(day) {
                                  case 'mon': return 'Thứ 2';
                                  case 'tue': return 'Thứ 3';
                                  case 'wed': return 'Thứ 4';
                                  case 'thu': return 'Thứ 5';
                                  case 'fri': return 'Thứ 6';
                                  case 'sat': return 'Thứ 7';
                                  case 'sun': return 'CN';
                                  default: return day;
                                }
                              }).join(', ')}
                            </span>
                          )}
                          
                          <span>
                            <span className="font-medium">Đăng ngày:</span> {format(new Date(demand.created_at), 'dd/MM/yyyy', { locale: vi })}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <nav className="flex items-center">
                  <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="px-2 py-1 border border-gray-300 bg-white text-gray-700 rounded-l-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <div className="px-4 py-1 border-t border-b border-gray-300 bg-white text-gray-700">
                    Trang {page} / {totalPages}
                  </div>
                  
                  <button
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className="px-2 py-1 border border-gray-300 bg-white text-gray-700 rounded-r-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Demands; 