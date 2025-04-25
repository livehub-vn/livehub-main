import { supabase } from "../supabase/client";

// Định nghĩa các kiểu dữ liệu
export interface IService {
  id: string;
  title: string;
  description: string;
  category: string;
  price_range: {
    min: number;
    max: number;
    currency: string;
  };
  provider: string; // User ID
  item_type: string; // 'service'
  previous_experience?: string;
  status: string; // 'pending' | 'approved' | 'rejected'
  image_urls?: string[];
  post_content?: string;
  is_public?: boolean;
  date_range?: {
    days?: string[];
  };
  contact_info?: {
    contacts?: {
      platform: string;
      value: string;
    }[];
  };
  created_at: string;
  updated_at: string;
}

export interface IServiceInput {
  title: string;
  description: string;
  category: string;
  price_range: {
    min: number;
    max: number;
    currency: string;
  };
  date_range?: {
    days?: string[];
  };
  previous_experience?: string;
  contact_info?: {
    contacts?: {
      platform: string;
      value: string;
    }[];
    name?: string;
    email?: string;
    phone?: string;
  };
  image_urls?: string[];
  status?: string;
  is_public?: boolean;
  post_content?: string;
  need_support?: boolean;
}

export interface IServiceFilter {
  category?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  status?: string;
  search?: string;
  ownerId?: string;
  is_public?: boolean;
}

// API calls
/**
 * Lấy danh sách dịch vụ với phân trang và bộ lọc
 */
export const getServices = async (page = 1, limit = 10, filter?: IServiceFilter) => {
  const start = (page - 1) * limit;
  const end = start + limit - 1;
  
  let query = supabase.from('item')
    .select('*')
    .eq('item_type', 'service');
  
  // Áp dụng các điều kiện lọc
  if (filter?.category) {
    query = query.eq('category', filter.category);
  }
  
  if (filter?.status) {
    query = query.eq('status', filter.status);
  }
  
  if (filter?.ownerId) {
    query = query.eq('owner_id', filter.ownerId);
  }
  
  if (filter?.is_public !== undefined) {
    query = query.eq('is_public', filter.is_public);
  }
  
  if (filter?.priceRange?.min !== undefined) {
    query = query.gte('price_range->min', filter.priceRange.min);
  }
  
  if (filter?.priceRange?.max !== undefined) {
    query = query.lte('price_range->max', filter.priceRange.max);
  }
  
  if (filter?.search) {
    query = query.or(`title.ilike.%${filter.search}%,description.ilike.%${filter.search}%`);
  }
  
  // Thực hiện phân trang
  const { data, error } = await query.range(start, end);
  
  if (error) {
    console.error('Error fetching services:', error);
    return { data: [], count: 0 };
  }
  
  // Lấy tổng số bản ghi
  const { data: countData, error: countError } = await supabase.from('item')
    .select('id', { count: 'exact', head: true })
    .eq('item_type', 'service');
  
  if (countError) {
    console.error('Error counting services:', countError);
    return { data: data || [], count: 0 };
  }
  
  return { data: data || [], count: countData?.length || 0 };
};

/**
 * Lấy chi tiết dịch vụ theo ID
 */
export const getServiceById = async (id: string) => {
  const { data, error } = await supabase.from('item')
    .select('*')
    .eq('id', id)
    .eq('item_type', 'service')
    .single();
  
  if (error) {
    console.error(`Error fetching service with ID ${id}:`, error);
    return null;
  }
  
  return data;
};

/**
 * Tạo dịch vụ mới
 */
export const createService = async (serviceData: IServiceInput) => {
  try {
    // Lấy thông tin người dùng hiện tại
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      throw new Error('Bạn cần đăng nhập để tạo dịch vụ');
    }

    const owner_id = session.user.id;
    
    // Đảm bảo có contact_info mặc định nếu không được cung cấp
    const defaultContactInfo = {
      name: session.user.email?.split('@')[0] || 'Người dùng',
      email: session.user.email || '',
      phone: ''
    };
    
    // Xử lý date_range nếu có
    let processedDateRange = serviceData.date_range;
    
    // Nếu date_range không có hoặc days là undefined, tạo một đối tượng date_range mặc định với days là mảng rỗng
    if (!processedDateRange || !processedDateRange.days) {
      processedDateRange = { days: [] };
    }
    
    console.log('Original date_range:', serviceData.date_range);
    console.log('Processed date_range:', processedDateRange);
    
    // Chỉ lấy các trường cần thiết để tránh lỗi schema
    // Loại bỏ trường 'note' và 'languages' vì chúng không thuộc schema
    const newService = {
      title: serviceData.title,
      description: serviceData.description,
      category: serviceData.category,
      price_range: serviceData.price_range,
      date_range: processedDateRange,
      previous_experience: serviceData.previous_experience,
      contact_info: serviceData.contact_info || defaultContactInfo,
      image_urls: serviceData.image_urls,
      post_content: serviceData.post_content,
      item_type: 'service',
      status: 'pending', // Mặc định là đang chờ phê duyệt
      is_public: serviceData.is_public !== undefined ? serviceData.is_public : false,
      owner_id: owner_id, // Thêm ID của người tạo
      need_support: false // Thêm giá trị mặc định cho need_support theo schema
    };
    
    console.log('Sending service data:', newService);
    console.log('Date range in service data:', JSON.stringify(newService.date_range));
    
    const { data, error } = await supabase.from('item')
      .insert([newService])
      .select();
    
    if (error) {
      console.error('Error creating service:', error);
      throw new Error(`Lỗi khi tạo dịch vụ: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      throw new Error('Không nhận được dữ liệu từ server');
    }
    
    console.log('Service created successfully:', data[0]);
    console.log('Created date_range:', data[0].date_range);
    
    return data[0];
  } catch (error: any) {
    console.error('Error in createService:', error);
    throw new Error(`Không thể tạo dịch vụ: ${error.message || 'Lỗi không xác định'}`);
  }
};

/**
 * Cập nhật dịch vụ
 */
export const updateService = async (id: string, serviceData: Partial<IServiceInput>) => {
  try {
    // Lấy thông tin dịch vụ hiện tại để lấy owner_id và contact_info
    const { data: existingService, error: getError } = await supabase.from('item')
      .select('owner_id, contact_info, date_range')
      .eq('id', id)
      .eq('item_type', 'service')
      .single();
    
    if (getError) {
      console.error('Error fetching existing service:', getError);
      throw new Error(`Không thể lấy thông tin dịch vụ: ${getError.message}`);
    }
    
    if (!existingService) {
      throw new Error('Không tìm thấy dịch vụ');
    }
    
    // Lấy thông tin người dùng hiện tại
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      throw new Error('Bạn cần đăng nhập để cập nhật dịch vụ');
    }

    // Kiểm tra xem người dùng có phải là chủ sở hữu dịch vụ không
    if (session.user.id !== existingService.owner_id) {
      throw new Error('Bạn không có quyền cập nhật dịch vụ này');
    }
    
    // Xử lý date_range nếu có
    let processedDateRange = serviceData.date_range;
    
    // Nếu date_range không có, giữ nguyên date_range hiện tại
    if (!processedDateRange) {
      processedDateRange = existingService.date_range;
    } 
    // Nếu date_range có nhưng days không có, đảm bảo days là mảng rỗng
    else if (!processedDateRange.days) {
      processedDateRange = { ...processedDateRange, days: [] };
    }
    
    console.log('Original date_range:', serviceData.date_range);
    console.log('Processed date_range:', processedDateRange);
    
    // Đảm bảo có contact_info
    const defaultContactInfo = {
      name: session.user.email?.split('@')[0] || 'Người dùng',
      email: session.user.email || '',
      phone: ''
    };
    
    // Chỉ lấy các trường cần thiết để tránh lỗi schema
    // Loại bỏ trường 'note' và 'languages' vì chúng không thuộc schema
    const updatedService = {
      title: serviceData.title,
      description: serviceData.description,
      category: serviceData.category,
      price_range: serviceData.price_range,
      date_range: processedDateRange,
      previous_experience: serviceData.previous_experience,
      contact_info: serviceData.contact_info || existingService.contact_info || defaultContactInfo,
      image_urls: serviceData.image_urls,
      post_content: serviceData.post_content,
      status: serviceData.status,
      is_public: serviceData.is_public,
      // Giữ nguyên owner_id từ dịch vụ hiện tại
      owner_id: existingService.owner_id,
      need_support: serviceData.hasOwnProperty('need_support') ? serviceData.need_support : false
    };
    
    // Lọc bỏ các trường undefined
    const filteredService: Record<string, any> = Object.entries(updatedService)
      .filter(([_, value]) => value !== undefined)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    console.log('Updating service with data:', filteredService);
    console.log('Date range in update data:', JSON.stringify(filteredService.date_range));
    
    const { data, error } = await supabase.from('item')
      .update(filteredService)
      .eq('id', id)
      .eq('item_type', 'service')
      .select();
    
    if (error) {
      console.error('Error updating service:', error);
      throw new Error(`Lỗi khi cập nhật dịch vụ: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      throw new Error('Không nhận được dữ liệu từ server hoặc không tìm thấy dịch vụ');
    }
    
    console.log('Service updated successfully:', data[0]);
    console.log('Updated date_range:', data[0].date_range);
    
    return data[0];
  } catch (error: any) {
    console.error('Error in updateService:', error);
    throw new Error(`Không thể cập nhật dịch vụ: ${error.message || 'Lỗi không xác định'}`);
  }
};

/**
 * Xóa dịch vụ
 */
export const deleteService = async (id: string) => {
  const { error } = await supabase.from('item')
    .delete()
    .eq('id', id)
    .eq('item_type', 'service');
  
  if (error) {
    console.error(`Error deleting service with ID ${id}:`, error);
    return false;
  }
  
  return true;
};

/**
 * Lấy dịch vụ của người dùng hiện tại
 */
export const getMyServices = async (userId: string, page = 1, limit = 10, filter?: IServiceFilter) => {
  return getServices(page, limit, { ...filter, ownerId: userId });
};

/**
 * Thay đổi trạng thái dịch vụ
 */
export const changeServiceStatus = async (id: string, status: string) => {
  const { data, error } = await supabase.from('item')
    .update({ status })
    .eq('id', id)
    .eq('item_type', 'service')
    .select();
  
  if (error) {
    console.error(`Error updating status for service with ID ${id}:`, error);
    return null;
  }
  
  return data[0];
};

/**
 * Lấy các dịch vụ nổi bật
 */
export const getFeaturedServices = async (limit = 10) => {
  const { data, error } = await supabase.from('item')
    .select('*')
    .eq('item_type', 'service')
    .eq('status', 'approved')
    .eq('is_public', true)
    .limit(limit);
  
  if (error) {
    console.error('Error fetching featured services:', error);
    return [];
  }
  
  return data;
};

/**
 * Tải lên hình ảnh cho dịch vụ
 */
export const uploadServiceImage = async (id: string, file: File) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await supabase.storage.from('service-images').upload(id, formData);
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy danh sách đơn đăng ký thuê dịch vụ
 */
export const getServiceRentals = async (serviceId: string, status?: string) => {
  try {
    const response = await supabase.from('service_rental')
      .select('*')
      .eq('service_id', serviceId)
      .eq('status', status)
      .order('created_at', { ascending: false });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Phê duyệt đơn đăng ký thuê dịch vụ
 */
export const approveServiceRental = async (rentalId: string) => {
  try {
    const response = await supabase.from('service_rental')
      .update({ status: 'approved' })
      .eq('id', rentalId);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Từ chối đơn đăng ký thuê dịch vụ
 */
export const rejectServiceRental = async (rentalId: string, reason?: string) => {
  try {
    const response = await supabase.from('service_rental')
      .update({ status: 'rejected', reject_reason: reason })
      .eq('id', rentalId);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Đánh dấu một dịch vụ là nổi bật (chỉ dành cho admin)
 */
export const featureService = async (id: string, featured: boolean) => {
  try {
    const response = await supabase.from('item')
      .update({ is_public: featured })
      .eq('id', id)
      .eq('item_type', 'service');
    return response.data;
  } catch (error) {
    throw error;
  }
}; 