import { supabase } from '../supabase/client';

// Định nghĩa các kiểu dữ liệu
export interface IDemand {
  id: string;
  title: string;
  description: string;
  owner_id: string; // User ID (thay cho creator_id)
  category: string;
  subcategory?: string;
  tags?: string[];
  price_range: {
    min: number;
    max: number;
    currency: string;
  };
  date_range?: {
    start?: string;
    end?: string;
    days?: string[];
  };
  attachments?: string[];
  location?: string;
  location_details?: string;
  languages?: string[];
  status: string; // 'active', 'pending', 'draft', etc.
  need_support?: boolean;
  note?: string;
  image_urls?: string[];
  post_content?: string;
  is_public?: boolean;
  item_type: string; // Luôn là 'demand'
  created_at: string;
  updated_at: string;
  featured?: boolean;
  contact_info?: any;
}

export interface IDemandInput {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  price_range: {
    min: number;
    max: number;
    currency: string;
  };
  date_range?: {
    start?: string;
    end?: string;
    days?: string[];
  };
  location?: string;
  location_details?: string;
  work_location?: string;
  languages?: string[];
  status?: string; // 'active', 'pending', 'draft'
  need_support?: boolean;
  note?: string;
  image_urls?: string[];
  post_content?: string;
  is_public?: boolean;
  item_type: string; // Luôn là 'demand'
  contact_info?: any;
  owner_id?: string; // ID của người tạo demand
}

export interface IDemandFilter {
  category?: string;
  subcategory?: string;
  experience_level?: string;
  location?: string;
  min_price?: number;
  max_price?: number;
  currency?: string;
  search?: string;
  featured?: boolean;
  status?: string;
  is_public?: boolean;
}

// Thêm interface cho demand application (nhu cầu ứng tuyển)
export interface IDemandApplication {
  id: string;
  demand_id: string;
  supplier_id: string;
  supplier_name?: string;
  demand_title?: string;
  contact_info: {
    address?: string;
    phone?: string;
    email?: string;
    contacts?: Array<{platform: string, value: string}>
  };
  promote_text?: string; // Chương trình khuyến mãi
  image_urls: string[]; // Hình ảnh
  note?: string; // Ghi chú cho admin
  status: string; // 'pending', 'approved', 'rejected'
  created_at: string;
  updated_at: string;
}

export interface IDemandApplicationInput {
  demand_id: string;
  applicant_name: string;
  demand_title: string;
  contact_info: {
    address: string;
    phone: string;
    email: string;
  };
  promotional_program?: string;
  image_urls?: string[];
  admin_notes?: string;
  status?: string;
}

// Thêm interface cho service rental (yêu cầu thuê)
export interface IServiceRental {
  id: string;
  service_id: string;
  service_title?: string;
  supplier_id?: string;
  supplier_name?: string;
  buyer_id: string;
  buyer_name?: string;
  selected_time_slots: {
    slots?: string[];
    days?: string[];
  };
  contact_info: {
    address?: string;
    phone?: string;
    email?: string;
    contacts?: Array<{platform: string, value: string}>
  };
  note?: string; // Ghi chú cho admin
  status: string; // 'pending', 'approved', 'rejected'
  expect_price_range: {
    min?: number;
    max?: number;
    amount?: number;
    currency: string;
  };
  created_at: string;
  updated_at: string;
}

export interface IServiceRentalInput {
  service_id: string;
  selected_time_slots: {
    slots?: string[];
    days?: string[];
  };
  contact_info: {
    address?: string;
    phone?: string;
    email?: string;
    contacts?: Array<{platform: string, value: string}>
  };
  note?: string; // Ghi chú cho admin
  expect_price_range: {
    min?: number;
    max?: number;
    amount?: number;
    currency: string;
  };
}

// API calls
/**
 * Lấy danh sách nhu cầu với phân trang và lọc
 */
export const getDemands = async (page = 1, limit = 10, filter?: IDemandFilter) => {
  try {
    // Tính toán range cho phân trang
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    let query = supabase
      .from('item')
      .select('*', { count: 'exact' })
      .eq('item_type', 'demand')
      .range(from, to);
    
    // Áp dụng các bộ lọc
    if (filter?.category) {
      query = query.eq('category', filter.category);
    }
    
    if (filter?.subcategory) {
      query = query.eq('subcategory', filter.subcategory);
    }
    
    if (filter?.experience_level) {
      query = query.eq('experience_level', filter.experience_level);
    }
    
    if (filter?.location) {
      query = query.eq('location', filter.location);
    }
    
    if (filter?.min_price) {
      query = query.gte('price_range->max', filter.min_price);
    }
    
    if (filter?.max_price) {
      query = query.lte('price_range->min', filter.max_price);
    }
    
    if (filter?.search) {
      query = query.or(`title.ilike.%${filter.search}%,description.ilike.%${filter.search}%`);
    }
    
    if (filter?.featured !== undefined) {
      query = query.eq('featured', filter.featured);
    }
    
    // Trạng thái mặc định là 'active' nếu không có bộ lọc
    if (filter?.status) {
      query = query.eq('status', filter.status);
    } else {
      query = query.eq('status', 'active');
    }
    
    // Is_public mặc định là true
    if (filter?.is_public !== undefined) {
      query = query.eq('is_public', filter.is_public);
    } else {
      query = query.eq('is_public', true);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      data: data || [],
      pagination: {
        totalItems: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
        currentPage: page
      }
    };
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhu cầu:', error);
    // Trả về dữ liệu trống nếu có lỗi, thay vì ném lỗi
    return {
      data: [],
      pagination: {
        totalItems: 0,
        totalPages: 0,
        currentPage: page
      }
    };
  }
};

/**
 * Lấy chi tiết nhu cầu theo ID
 */
export const getDemandById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('item')
      .select('*')
      .eq('id', id)
      .eq('item_type', 'demand')
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Tạo nhu cầu mới
 */
export const createDemand = async (demandData: IDemandInput) => {
  try {
    // Lấy thông tin người dùng hiện tại từ session
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error('Không có phiên đăng nhập');
    }
    
    const userId = session.session.user.id;
    
    // Đảm bảo item_type là 'demand'
    const newDemand = {
      ...demandData,
      item_type: 'demand',
      status: demandData.status || 'pending',
      owner_id: userId // Thêm owner_id từ người dùng đăng nhập
    };
    
    // Đảm bảo không có trường budget nếu tồn tại
    if ('budget' in newDemand) {
      delete (newDemand as any).budget;
    }
    
    // Đảm bảo không có trường experience_level nếu tồn tại
    if ('experience_level' in newDemand) {
      delete (newDemand as any).experience_level;
    }
    
    // Đảm bảo không có trường duration nếu tồn tại
    if ('duration' in newDemand) {
      delete (newDemand as any).duration;
    }
    
    // Đảm bảo không có trường location nếu tồn tại
    if ('location' in newDemand) {
      delete (newDemand as any).location;
    }
    
    // Đảm bảo price_range có đúng định dạng
    if (!newDemand.price_range) {
      newDemand.price_range = {
        min: 0,
        max: 0,
        currency: 'VND'
      };
    }
    
    const { data, error } = await supabase
      .from('item')
      .insert([newDemand])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Cập nhật nhu cầu
 */
export const updateDemand = async (id: string, demandData: Partial<IDemandInput>) => {
  try {
    const updateData = { ...demandData };
    
    // Đảm bảo không có trường budget nếu tồn tại
    if ('budget' in updateData) {
      delete (updateData as any).budget;
    }
    
    // Đảm bảo không có trường experience_level nếu tồn tại
    if ('experience_level' in updateData) {
      delete (updateData as any).experience_level;
    }
    
    // Đảm bảo không có trường duration nếu tồn tại
    if ('duration' in updateData) {
      delete (updateData as any).duration;
    }
    
    // Đảm bảo không có trường location nếu tồn tại
    if ('location' in updateData) {
      delete (updateData as any).location;
    }
    
    // Đảm bảo giữ nguyên item_type
    updateData.item_type = 'demand';
    
    const { data, error } = await supabase
      .from('item')
      .update(updateData)
      .eq('id', id)
      .eq('item_type', 'demand')
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Xóa nhu cầu
 */
export const deleteDemand = async (id: string) => {
  try {
    const { error } = await supabase
      .from('item')
      .delete()
      .eq('id', id)
      .eq('item_type', 'demand');
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    throw error;
  }
};

/**
 * Tải lên tệp đính kèm cho nhu cầu
 */
export const uploadDemandAttachment = async (id: string, file: File) => {
  try {
    const filePath = `demands/${id}/${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('item-images')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Lấy URL của file vừa upload
    const { data } = supabase.storage
      .from('item-images')
      .getPublicUrl(filePath);
    
    // Cập nhật danh sách image_urls của demand
    const { data: demand, error: getError } = await supabase
      .from('item')
      .select('image_urls')
      .eq('id', id)
      .eq('item_type', 'demand')
      .single();
    
    if (getError) throw getError;
    
    const currentImages = demand.image_urls || [];
    const updatedImages = [...currentImages, data.publicUrl];
    
    const { error: updateError } = await supabase
      .from('item')
      .update({ image_urls: updatedImages })
      .eq('id', id)
      .eq('item_type', 'demand');
    
    if (updateError) throw updateError;
    
    return { url: data.publicUrl };
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy các nhu cầu của người dùng hiện tại
 */
export const getMyDemands = async (page = 1, limit = 10, status?: string) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error('Không có phiên đăng nhập');
    }
    
    const userId = session.session.user.id;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    let query = supabase
      .from('item')
      .select('*', { count: 'exact' })
      .eq('owner_id', userId)
      .eq('item_type', 'demand')
      .range(from, to);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      data: data || [],
      pagination: {
        totalItems: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
        currentPage: page
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Thay đổi trạng thái nhu cầu
 */
export const changeDemandStatus = async (id: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from('item')
      .update({ status })
      .eq('id', id)
      .eq('item_type', 'demand')
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy những nhu cầu được đề xuất
 */
export const getFeaturedDemands = async (limit = 6) => {
  try {
    const { data, error } = await supabase
      .from('item')
      .select('*')
      .eq('item_type', 'demand')
      .eq('featured', true)
      .eq('status', 'active')
      .eq('is_public', true)
      .limit(limit);
    
    if (error) throw error;
    
    return { data: data || [] };
  } catch (error) {
    throw error;
  }
};

/**
 * Đánh dấu nhu cầu là nổi bật (chỉ admin mới có thể thực hiện)
 */
export const featureDemand = async (id: string, featured: boolean) => {
  try {
    // Trong thực tế, nên có kiểm tra quyền admin ở đây
    const { data, error } = await supabase
      .from('item')
      .update({ featured })
      .eq('id', id)
      .eq('item_type', 'demand')
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

export const createDemandApplication = async (application: IDemandApplicationInput): Promise<IDemandApplication | null> => {
  try {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      console.error('Không thể đăng kí đơn: Chưa đăng nhập');
      return null;
    }
    
    const { data, error } = await supabase
      .from('demand_applications')
      .insert({
        ...application,
        created_by: session.data.session.user.id,
        status: application.status || 'pending'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Lỗi khi đăng kí đơn:', error);
      return null;
    }
    
    return data as IDemandApplication;
  } catch (error) {
    console.error('Lỗi khi đăng kí đơn:', error);
    return null;
  }
};

export const getDemandApplications = async (demandId: string): Promise<IDemandApplication[]> => {
  try {
    const { data, error } = await supabase
      .from('demand_applications')
      .select('*')
      .eq('demand_id', demandId);
    
    if (error) {
      console.error('Lỗi khi lấy danh sách đơn đăng kí:', error);
      return [];
    }
    
    return data as IDemandApplication[];
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn đăng kí:', error);
    return [];
  }
};

export const getMyDemandApplications = async (): Promise<IDemandApplication[]> => {
  try {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      console.error('Không thể lấy danh sách đơn: Chưa đăng nhập');
      return [];
    }
    
    const { data, error } = await supabase
      .from('demand_applications')
      .select('*')
      .eq('created_by', session.data.session.user.id);
    
    if (error) {
      console.error('Lỗi khi lấy danh sách đơn đăng kí của tôi:', error);
      return [];
    }
    
    return data as IDemandApplication[];
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn đăng kí của tôi:', error);
    return [];
  }
}; 