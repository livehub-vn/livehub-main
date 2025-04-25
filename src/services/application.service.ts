import axios from 'axios';
import { API_URL } from '../config';

// Định nghĩa các kiểu dữ liệu
export interface IApplication {
  _id: string;
  demand: string; // Demand ID
  freelancer: string; // User ID
  coverLetter: string;
  proposal: {
    price: number;
    currency: string;
    timeframe: {
      value: number;
      unit: 'hours' | 'days' | 'weeks' | 'months';
    };
  };
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  attachments?: string[];
  portfolio?: {
    title: string;
    description: string;
    links: string[];
    images?: string[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IApplicationInput {
  demand: string;
  coverLetter: string;
  proposal: {
    price: number;
    currency: string;
    timeframe: {
      value: number;
      unit: 'hours' | 'days' | 'weeks' | 'months';
    };
  };
  attachments?: string[];
  portfolio?: {
    title: string;
    description: string;
    links: string[];
    images?: string[];
  }[];
}

export interface IApplicationFilter {
  status?: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  dateRange?: {
    from: Date;
    to: Date;
  };
}

// API calls
/**
 * Lấy danh sách ứng tuyển cho một nhu cầu cụ thể
 */
export const getDemandApplications = async (demandId: string, page = 1, limit = 10, filter?: IApplicationFilter) => {
  try {
    const params = { page, limit, ...filter };
    const response = await axios.get(`${API_URL}/demands/${demandId}/applications`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy chi tiết một ứng tuyển theo ID
 */
export const getApplicationById = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/applications/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Gửi ứng tuyển vào một nhu cầu
 */
export const applyToDemand = async (applicationData: IApplicationInput) => {
  try {
    const response = await axios.post(`${API_URL}/applications`, applicationData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Cập nhật ứng tuyển
 */
export const updateApplication = async (id: string, applicationData: Partial<IApplicationInput>) => {
  try {
    const response = await axios.put(`${API_URL}/applications/${id}`, applicationData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Rút lại ứng tuyển
 */
export const withdrawApplication = async (id: string) => {
  try {
    const response = await axios.put(`${API_URL}/applications/${id}/withdraw`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Chấp nhận một ứng tuyển (cho người tạo nhu cầu)
 */
export const approveApplication = async (id: string) => {
  try {
    const response = await axios.put(`${API_URL}/applications/${id}/approve`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Từ chối một ứng tuyển (cho người tạo nhu cầu)
 */
export const rejectApplication = async (id: string, reason?: string) => {
  try {
    const response = await axios.put(`${API_URL}/applications/${id}/reject`, { reason });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Tải lên tệp đính kèm cho ứng tuyển
 */
export const uploadApplicationAttachment = async (id: string, file: File) => {
  try {
    const formData = new FormData();
    formData.append('attachment', file);
    
    const response = await axios.post(`${API_URL}/applications/${id}/attachments`, formData, {
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
 * Lấy danh sách các ứng tuyển của người dùng hiện tại
 */
export const getMyApplications = async (page = 1, limit = 10, filter?: IApplicationFilter) => {
  try {
    const params = { page, limit, ...filter };
    const response = await axios.get(`${API_URL}/applications/me`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 