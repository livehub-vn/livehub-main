import axios from 'axios';
import { API_URL } from '../config';
import { supabase } from "../supabase/client";

export interface IImage {
  path: string;
  url: string;
  size?: number;
  type?: string;
}

export async function uploadImage(file: File, folder: string, id: string): Promise<IImage | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${id}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('public')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('public')
      .getPublicUrl(filePath);

    return {
      path: filePath,
      url: data.publicUrl,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('Error in uploadImage:', error);
    return null;
  }
}

export interface IReviewInput {
  target_id: string;
  target_type: 'service' | 'demand';
  order_id: string;
  rating: number;
  content: string;
  images: string[];
}

export interface IReview extends IReviewInput {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface IReviewFilter {
  targetId?: string;
  targetType?: 'service' | 'user';
  reviewerId?: string;
  rating?: number;
  status?: 'pending' | 'approved' | 'rejected';
}

// API calls
/**
 * Lấy danh sách đánh giá theo bộ lọc
 */
export const getReviews = async (page = 1, limit = 10, filter?: IReviewFilter) => {
  try {
    const params = { page, limit, ...filter };
    const response = await axios.get(`${API_URL}/reviews`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy đánh giá theo ID
 */
export const getReviewById = async (id: string): Promise<IReview | null> => {
  try {
    const response = await axios.get(`${API_URL}/reviews/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error getting review:', error);
    return null;
  }
};

/**
 * Lấy tất cả đánh giá của một dịch vụ
 */
export const getServiceReviews = async (serviceId: string, page = 1, limit = 10) => {
  try {
    const params = { 
      page, 
      limit, 
      targetId: serviceId, 
      targetType: 'service',
      status: 'approved'
    };
    const response = await axios.get(`${API_URL}/reviews`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy tất cả đánh giá của một người dùng
 */
export const getUserReviews = async (userId: string, page = 1, limit = 10) => {
  try {
    const params = { 
      page, 
      limit, 
      targetId: userId, 
      targetType: 'user',
      status: 'approved'
    };
    const response = await axios.get(`${API_URL}/reviews`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Tạo đánh giá mới
 */
export const createReview = async (reviewData: IReviewInput): Promise<IReview | null> => {
  try {
    const response = await axios.post(`${API_URL}/reviews`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Error creating review:', error);
    return null;
  }
};

/**
 * Cập nhật đánh giá
 */
export const updateReview = async (id: string, reviewData: Partial<IReviewInput>) => {
  try {
    // Xử lý trường hợp có ảnh cần tải lên
    if (reviewData.images && reviewData.images.length > 0) {
      const formData = new FormData();
      // Thêm các trường thông tin vào formData
      (Object.keys(reviewData) as Array<keyof IReviewInput>).forEach(key => {
        if (key !== 'images' && key in reviewData) {
          formData.append(key, String(reviewData[key]));
        }
      });
      
      // Thêm các ảnh vào formData
      reviewData.images.forEach((image, _index) => {
        formData.append(`images`, image);
      });
      
      const response = await axios.put(`${API_URL}/reviews/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } else {
      // Trường hợp không có ảnh
      const response = await axios.put(`${API_URL}/reviews/${id}`, reviewData);
      return response.data;
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Xóa đánh giá
 */
export const deleteReview = async (id: string) => {
  try {
    const response = await axios.delete(`${API_URL}/reviews/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Trả lời đánh giá (dành cho người nhận đánh giá)
 */
export const replyToReview = async (id: string, content: string) => {
  try {
    const response = await axios.post(`${API_URL}/reviews/${id}/reply`, { content });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy danh sách đánh giá mà người dùng hiện tại đã viết
 */
export const getMyWrittenReviews = async (page = 1, limit = 10) => {
  try {
    const params = { page, limit };
    const response = await axios.get(`${API_URL}/reviews/me/written`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy danh sách đánh giá mà người dùng hiện tại đã nhận
 */
export const getMyReceivedReviews = async (page = 1, limit = 10) => {
  try {
    const params = { page, limit };
    const response = await axios.get(`${API_URL}/reviews/me/received`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export async function getReviewsByServiceId(serviceId: string): Promise<IReview[]> {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        user:user_id (
          id,
          email,
          metadata
        )
      `)
      .eq("service_id", serviceId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }

    // Xử lý dữ liệu user để lấy tên và avatar
    const processedData = data.map(review => {
      const metadata = review.user?.metadata || {};
      return {
        ...review,
        user: {
          id: review.user?.id || "",
          email: review.user?.email || "",
          name: metadata.name || "Người dùng ẩn danh",
          avatar_url: metadata.avatar_url || ""
        }
      };
    });

    return processedData;
  } catch (error) {
    console.error("Error in getReviewsByServiceId:", error);
    return [];
  }
}

interface User {
  id: string;
  email: string;
}

async function getUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return {
      id: user.id,
      email: user.email || ''
    };
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export async function getReviewsByUserId(): Promise<IReview[]> {
  try {
    const user = await getUser();
    if (!user) {
      throw new Error("Bạn cần đăng nhập để xem đánh giá");
    }

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user reviews:", error);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Error in getReviewsByUserId:", error);
    return [];
  }
}

/**
 * Xóa đánh giá của người dùng hiện tại
 */
export async function deleteUserReview(reviewId: string): Promise<boolean> {
  try {
    const user = await getUser();
    if (!user) {
      throw new Error("Bạn cần đăng nhập để xóa đánh giá");
    }

    // Kiểm tra xem review có thuộc về người dùng hiện tại không
    const { data: review } = await supabase
      .from("reviews")
      .select("*")
      .eq("id", reviewId)
      .eq("user_id", user.id)
      .single();

    if (!review) {
      throw new Error("Không tìm thấy đánh giá hoặc bạn không có quyền xóa");
    }

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (error) {
      console.error("Error deleting review:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteUserReview:", error);
    return false;
  }
}
