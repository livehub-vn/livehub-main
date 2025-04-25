import axios from 'axios';
import { API_URL } from '../config';

// Định nghĩa các kiểu dữ liệu
export interface IDemandApplication {
  _id: string;
  demand: string; // Demand ID
  applicant: string; // User ID
  coverLetter: string;
  proposedBudget: {
    amount: number;
    currency: string;
  };
  proposedDuration: {
    value: number;
    unit: 'hours' | 'days' | 'weeks' | 'months';
  };
  attachments?: string[];
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDemandApplicationInput {
  demand: string;
  coverLetter: string;
  proposedBudget: {
    amount: number;
    currency: string;
  };
  proposedDuration: {
    value: number;
    unit: 'hours' | 'days' | 'weeks' | 'months';
  };
  attachments?: string[];
}

export interface IDemandApplicationFilter {
  status?: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  search?: string;
}

// API calls
/**
 * Lấy danh sách các đơn ứng tuyển của người dùng hiện tại
 */
export const getMyApplications = async (page = 1, limit = 10, filter?: IDemandApplicationFilter) => {
  try {
    const params = { page, limit, ...filter };
    const response = await axios.get(`${API_URL}/demand-applications/me`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy chi tiết một đơn ứng tuyển theo ID
 */
export const getApplicationById = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/demand-applications/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Tạo đơn ứng tuyển mới cho một nhu cầu
 */
export const createApplication = async (applicationData: IDemandApplicationInput) => {
  try {
    const response = await axios.post(`${API_URL}/demand-applications`, applicationData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Cập nhật đơn ứng tuyển
 */
export const updateApplication = async (id: string, applicationData: Partial<IDemandApplicationInput>) => {
  try {
    const response = await axios.put(`${API_URL}/demand-applications/${id}`, applicationData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Hủy đơn ứng tuyển
 */
export const withdrawApplication = async (id: string) => {
  try {
    const response = await axios.put(`${API_URL}/demand-applications/${id}/withdraw`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Tải lên tệp đính kèm cho đơn ứng tuyển
 */
export const uploadApplicationAttachment = async (id: string, file: File) => {
  try {
    const formData = new FormData();
    formData.append('attachment', file);
    
    const response = await axios.post(`${API_URL}/demand-applications/${id}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Chấp nhận đơn ứng tuyển (chỉ chủ sở hữu nhu cầu mới có thể thực hiện)
 */
export const approveApplication = async (id: string) => {
  try {
    const response = await axios.put(`${API_URL}/demand-applications/${id}/approve`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Từ chối đơn ứng tuyển (chỉ chủ sở hữu nhu cầu mới có thể thực hiện)
 */
export const rejectApplication = async (id: string, rejectionReason: string) => {
  try {
    const response = await axios.put(`${API_URL}/demand-applications/${id}/reject`, { rejectionReason });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy tất cả các đơn ứng tuyển cho một nhu cầu cụ thể (chỉ chủ sở hữu nhu cầu mới có thể thực hiện)
 */
export const getApplicationsForDemand = async (demandId: string, page = 1, limit = 10, status?: 'pending' | 'approved' | 'rejected' | 'withdrawn') => {
  try {
    const params = { page, limit, status };
    const response = await axios.get(`${API_URL}/demands/${demandId}/applications`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 