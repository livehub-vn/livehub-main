import React, { useState } from 'react';

interface ServiceRentalFormData {
  service_id: string;
  buyer_id: string;
  contact_info: {
    name: string;
    phone: string;
    email: string;
    address?: string;
  };
  expect_price_range: {
    min: number;
    max: number;
    currency: string;
  };
  note?: string;
}

interface ServiceRentalFormProps {
  serviceId: string;
  buyerId: string;
  onSubmit: (data: ServiceRentalFormData) => Promise<void>;
}

const ServiceRentalForm: React.FC<ServiceRentalFormProps> = ({
  serviceId,
  buyerId,
  onSubmit
}) => {
  const [formData, setFormData] = useState<ServiceRentalFormData>({
    service_id: serviceId,
    buyer_id: buyerId,
    contact_info: {
      name: '',
      phone: '',
      email: '',
      address: ''
    },
    expect_price_range: {
      min: 0,
      max: 0,
      currency: 'VND'
    },
    note: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, field] = name.split('.');
      setFormData(prev => {
        const parentObj = prev[parent as keyof ServiceRentalFormData];
        if (typeof parentObj === 'object' && parentObj !== null) {
          return {
            ...prev,
            [parent]: {
              ...parentObj,
              [field]: value
            }
          };
        }
        return prev;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contact Info */}
      <div className="space-y-4">
        <div>
          <label htmlFor="contact_info.name" className="block text-sm font-medium text-gray-700">
            Họ và tên
          </label>
          <input
            type="text"
            id="contact_info.name"
            name="contact_info.name"
            value={formData.contact_info.name}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="contact_info.email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="contact_info.email"
            name="contact_info.email"
            value={formData.contact_info.email}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="contact_info.phone" className="block text-sm font-medium text-gray-700">
            Số điện thoại
          </label>
          <input
            type="tel"
            id="contact_info.phone"
            name="contact_info.phone"
            value={formData.contact_info.phone}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="contact_info.address" className="block text-sm font-medium text-gray-700">
            Địa chỉ
          </label>
          <input
            type="text"
            id="contact_info.address"
            name="contact_info.address"
            value={formData.contact_info.address}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <div>
          <label htmlFor="expect_price_range.min" className="block text-sm font-medium text-gray-700">
            Giá tối thiểu
          </label>
          <input
            type="number"
            id="expect_price_range.min"
            name="expect_price_range.min"
            value={formData.expect_price_range.min}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="expect_price_range.max" className="block text-sm font-medium text-gray-700">
            Giá tối đa
          </label>
          <input
            type="number"
            id="expect_price_range.max"
            name="expect_price_range.max"
            value={formData.expect_price_range.max}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Note */}
      <div>
        <label htmlFor="note" className="block text-sm font-medium text-gray-700">Ghi chú</label>
        <textarea
          id="note"
          name="note"
          value={formData.note}
          onChange={handleInputChange}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Nhập ghi chú nếu có..."
        />
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Gửi yêu cầu
      </button>
    </form>
  );
};

export default ServiceRentalForm; 