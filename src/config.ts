// Cấu hình API và các biến môi trường

// URL API cơ sở, sử dụng biến môi trường nếu có, hoặc giá trị mặc định
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Thời gian hết hạn token (ms)
export const TOKEN_EXPIRATION = 24 * 60 * 60 * 1000; // 24 giờ

// Cấu hình phân trang mặc định
export const DEFAULT_PAGE_SIZE = 10;

// Các trạng thái của đơn đăng ký dịch vụ
export const SERVICE_RENTAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELED: 'canceled'
};

// Vai trò người dùng
export const USER_ROLES = {
  ADMIN: 'admin',
  SERVICE: 'service', // Nhà cung cấp dịch vụ
  DEMAND: 'demand'    // Người tìm kiếm dịch vụ
}; 