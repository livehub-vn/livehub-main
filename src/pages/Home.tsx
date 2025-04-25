import Hero from '../components/Hero';
import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    {
      title: 'Thiết bị chất lượng cao',
      description: 'Cung cấp các thiết bị livestream chuyên nghiệp từ các thương hiệu uy tín.',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Đội ngũ chuyên nghiệp',
      description: 'Hỗ trợ kỹ thuật 24/7 từ đội ngũ chuyên gia giàu kinh nghiệm.',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: 'Giá cả cạnh tranh',
      description: 'Chi phí hợp lý với nhiều gói dịch vụ phù hợp mọi nhu cầu.',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const stats = [
    { number: '1000+', label: 'Khách hàng hài lòng' },
    { number: '50+', label: 'Đối tác tin cậy' },
    { number: '24/7', label: 'Hỗ trợ kỹ thuật' },
    { number: '100%', label: 'Cam kết chất lượng' },
  ];

  return (
    <div className="bg-white">
      <Hero />
      
      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Tại sao chọn LiveHub?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Chúng tôi cung cấp giải pháp livestream toàn diện cho doanh nghiệp của bạn
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="pt-6">
                  <div className="flow-root bg-white rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-orange-500 rounded-md shadow-lg">
                          <div className="h-6 w-6 text-white">{feature.icon}</div>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="mt-5 text-base text-gray-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-orange-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl font-extrabold text-white">{stat.number}</p>
                <p className="mt-2 text-base font-medium text-orange-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="bg-orange-50 rounded-lg shadow-xl overflow-hidden">
            <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
              <div className="lg:self-center">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                  <span className="block">Sẵn sàng để bắt đầu?</span>
                  <span className="block text-orange-600">Hãy liên hệ với chúng tôi ngay hôm nay.</span>
                </h2>
                <p className="mt-4 text-lg leading-6 text-gray-500">
                  Đội ngũ chuyên gia của chúng tôi sẽ tư vấn giải pháp phù hợp nhất cho bạn.
                </p>
                <Link
                  to="/contact"
                  className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700"
                >
                  Liên hệ ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 