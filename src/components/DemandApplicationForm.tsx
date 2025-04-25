import React, { useState } from 'react';
import { createDemandApplication } from '../services/demand_application.service';

export interface IDemandApplicationInput {
    demand_id: string;
    demand_title: string;
    applicant_name: string;
    promote_text: string;
    image_urls: string[];
    note?: string;
    contact_info: {
        address: string;
        phone: string;
        email: string;
    };
    supplier_id: string;
}

interface DemandApplicationFormProps {
    demandId: string;
    demandName: string;
    supplierId: string;
    onSuccess?: () => void;
}

const DemandApplicationForm: React.FC<DemandApplicationFormProps> = ({
    demandId,
    demandName,
    supplierId,
    onSuccess
}) => {
    const [formData, setFormData] = useState<IDemandApplicationInput>({
        demand_id: demandId,
        demand_title: demandName,
        applicant_name: '',
        supplier_id: supplierId,
        promote_text: '',
        image_urls: [],
        note: '',
        contact_info: {
            address: '',
            phone: '',
            email: ''
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createDemandApplication(formData);
            onSuccess?.();
        } catch (error) {
            console.error('Error submitting application:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('contact_info.')) {
            const field = name.split('.')[1];
            setFormData({
                ...formData,
                contact_info: {
                    ...formData.contact_info,
                    [field]: value
                }
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newImageUrls = Array.from(e.target.files).map(file => URL.createObjectURL(file));
            setFormData({
                ...formData,
                image_urls: [...formData.image_urls, ...newImageUrls]
            });
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Yêu cầu ứng tuyển</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tên người ứng tuyển</label>
                    <input
                        type="text"
                        name="applicant_name"
                        value={formData.applicant_name}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                    <input
                        type="text"
                        name="contact_info.address"
                        value={formData.contact_info.address}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                    <input
                        type="tel"
                        name="contact_info.phone"
                        value={formData.contact_info.phone}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        name="contact_info.email"
                        value={formData.contact_info.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Nội dung quảng bá</label>
                    <textarea
                        name="promote_text"
                        value={formData.promote_text}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Ghi chú thêm</label>
                    <textarea
                        name="note"
                        value={formData.note}
                        onChange={handleInputChange}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Hình ảnh</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        multiple
                        className="mt-1 block w-full"
                    />
                    <div className="mt-2 grid grid-cols-3 gap-2">
                        {formData.image_urls.map((url, index) => (
                            <img
                                key={index}
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded"
                            />
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Gửi đơn ứng tuyển
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DemandApplicationForm; 