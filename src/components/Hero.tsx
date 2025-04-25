import Logo from '../assets/Logo.png';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="bg-[#F8F6EC] pt-20">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            LiveHub - Giải pháp livestream toàn diện cho thương hiệu của bạn
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Kết nối khách hàng với các nhà cung cấp dịch vụ hỗ trợ thiết bị livestream hàng đầu.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md font-medium text-center"
            >
              Đăng ký ngay
            </Link>
            <Link
              to="/services"
              className="border border-gray-300 hover:border-orange-500 text-gray-700 hover:text-orange-500 px-6 py-3 rounded-md font-medium text-center"
            >
              Xem dịch vụ
            </Link>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <img
            src={Logo}
            alt="LiveHub Logo"
            className="w-full max-w-md object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero; 