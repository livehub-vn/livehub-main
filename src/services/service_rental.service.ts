import { supabase } from "../supabase/client";

// Interface cho service rental (yêu cầu thuê)
export interface IServiceRental {
  id: string;
  service_id: string;
  buyer_id: string;
  selected_time_slots: {
    start: string;
    end: string;
  };
  expect_price_range: {
    min?: number;
    max?: number;
    amount?: number;
    currency: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'cancelled';
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface IServiceRentalInput {
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'cancelled';
  service_id: string;
  buyer_id: string;
  selected_time_slots: {
    start: string;
    end: string;
  };
  expect_price_range: {
    min: number;
    max: number;
    currency: string;
  };
  note?: string;
  contact_info: {
    name: string;
    phone: string;
    email: string;
    address?: string;
  };
}

export interface IServiceRentalFilter {
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

// Lấy tất cả đơn đặt dịch vụ
export const getAllServiceRentals = async () => {
  const { data, error } = await supabase.from('service_rental').select('*');
  if (error) {
    console.error('Error fetching service rentals:', error);
    return [];
  }
  return data;
};

/**
 * Lấy danh sách yêu cầu thuê theo ID dịch vụ
 */
export const getServiceRentalsByServiceId = async (serviceId: string) => {
  try {
    const { data, error } = await supabase
      .from('service_rental')
      .select(`
        *,
        buyer:buyer_id (*)
      `)
      .eq('service_id', serviceId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Xử lý dữ liệu để thêm tên người thuê và tên dịch vụ
    const formattedData = data?.map(item => ({
      ...item,
      buyer_name: item.buyer?.user_metadata?.fullName || 'Chưa có tên',
      service_title: item.service?.title || 'Chưa có tiêu đề',
      supplier_id: item.service?.owner_id
    }));
    
    return formattedData || [];
  } catch (error: unknown) {
    if (error instanceof Error) {
    console.error('Lỗi khi lấy danh sách thuê dịch vụ:', error);
      throw new Error(`Không thể lấy danh sách thuê dịch vụ: ${error.message}`);
    }
    throw new Error('Đã xảy ra lỗi không xác định');
  }
};

/**
 * Lấy yêu cầu thuê theo ID
 */
export const getServiceRentalById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('service_rental')
      .select(`
        *,
        service:service_id (
          id,
          title,
          description,
          image_urls,
          price_range
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin đơn thuê dịch vụ:', error);
    throw error;
  }
};

// Lấy đơn đặt dịch vụ theo ID của người mua
export const getServiceRentalsByBuyerId = async (buyerId: string) => {
  try {
    const { data, error } = await supabase
      .from('service_rental')
      .select(`
        *,
        service:service_id (*)
      `)
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error fetching service rentals:', error);
    throw new Error(`Không thể lấy danh sách thuê dịch vụ: ${error.message}`);
  }
};

/**
 * Tạo yêu cầu thuê mới
 */
export const createServiceRental = async (data: IServiceRentalInput) => {
  try {
    const { data: result, error } = await supabase
      .from('service_rental')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Lỗi khi tạo đơn thuê dịch vụ:', error);
    throw error;
  }
};

/**
 * Cập nhật yêu cầu thuê
 */
export const updateServiceRental = async (id: string, rentalData: Partial<IServiceRentalInput>) => {
  try {
    const { data, error } = await supabase
      .from('service_rental')
      .update(rentalData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Xóa yêu cầu thuê
 */
export const deleteServiceRental = async (id: string) => {
  try {
    const { error } = await supabase
      .from('service_rental')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    throw error;
  }
};

/**
 * Thay đổi trạng thái yêu cầu thuê
 */
export const changeServiceRentalStatus = async (id: string, status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled') => {
  try {
    const { data, error } = await supabase
      .from('service_rental')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Hủy đơn thuê dịch vụ
 */
export const cancelServiceRental = async (id: string, reason?: string) => {
  const { data, error } = await supabase.from('service_rental')
    .update({ status: 'canceled', note: reason })
    .eq('id', id)
    .select();
  
  if (error) {
    console.error(`Error canceling service rental with ID ${id}:`, error);
    return null;
  }
  return data[0];
};

/**
 * Đánh dấu hoàn thành đơn thuê dịch vụ
 */
export const completeServiceRental = async (id: string) => {
  const { data, error } = await supabase.from('service_rental')
    .update({ status: 'completed' })
    .eq('id', id)
    .select();
  
  if (error) {
    console.error(`Error completing service rental with ID ${id}:`, error);
    return null;
  }
  return data[0];
};

// Lấy tổng số đơn đặt dịch vụ
export const getServiceRentalCount = async () => {
  const { data, error } = await supabase.from('service_rental').select('*', { count: 'exact', head: true });
  if (error) {
    console.error('Error counting service rentals:', error);
    return 0;
  }
  return data.length;
};

// Lấy tổng số đơn đặt dịch vụ theo trạng thái
export const getServiceRentalCountByStatus = async (status: string) => {
  const { data, error } = await supabase.from('service_rental').select('*', { count: 'exact', head: true }).eq('status', status);
  if (error) {
    console.error(`Error counting service rentals with status ${status}:`, error);
    return 0;
  }
  return data.length;
};

// Lấy đơn đặt dịch vụ với phân trang
export const getServiceRentalsWithPagination = async (page = 1, limit = 10) => {
  const start = (page - 1) * limit;
  const end = start + limit - 1;
  
  const { data, error } = await supabase.from('service_rental').select('*').range(start, end);
  
  if (error) {
    console.error('Error fetching service rentals with pagination:', error);
    return { data: [], count: 0 };
  }
  
  // Lấy tổng số bản ghi
  const { data: countData, error: countError } = await supabase.from('service_rental').select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.error('Error counting service rentals:', countError);
    return { data: data || [], count: 0 };
  }
  
  return { data: data || [], count: countData?.length || 0 };
};

/**
 * Lấy danh sách các đơn thuê dịch vụ của người dùng hiện tại
 */
export const getMyServiceRentals = async (userId: string, page = 1, limit = 10, filter?: IServiceRentalFilter) => {
  const start = (page - 1) * limit;
  const end = start + limit - 1;
  
  let query = supabase.from('service_rental')
    .select('*')
    .eq('buyer_id', userId);
  
  if (filter?.status) {
    query = query.eq('status', filter.status);
  }
  
  const { data, error } = await query.range(start, end);
  
  if (error) {
    console.error('Error fetching my service rentals:', error);
    return { data: [], count: 0 };
  }
  
  // Lấy tổng số bản ghi
  let countQuery = supabase.from('service_rental')
    .select('*', { count: 'exact', head: true })
    .eq('buyer_id', userId);
  
  if (filter?.status) {
    countQuery = countQuery.eq('status', filter.status);
  }
  
  const { data: countData, error: countError } = await countQuery;
  
  if (countError) {
    console.error('Error counting my service rentals:', countError);
    return { data: data || [], count: 0 };
  }
  
  return { data: data || [], count: countData?.length || 0 };
};

/**
 * Lấy danh sách các đơn thuê dịch vụ cho các dịch vụ của người dùng hiện tại
 */
export const getRentalsForMyServices = async () => {
  try {
    // Lấy thông tin người dùng hiện tại
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error('Không có phiên đăng nhập');
    }
    
    const userId = session.session.user.id;
    
    // Lấy danh sách dịch vụ của người dùng
    const { data: myServices, error: servicesError } = await supabase
      .from('item')
      .select('id')
      .eq('owner_id', userId)
      .eq('item_type', 'service');
    
    if (servicesError) throw servicesError;
    
    if (!myServices || myServices.length === 0) {
      return [];
    }
    
    // Lấy danh sách ID của các dịch vụ
    const serviceIds = myServices.map(service => service.id);
    
    // Lấy danh sách đơn thuê dịch vụ cho các dịch vụ của người dùng
    const { data: rentals, error: rentalsError } = await supabase
      .from('service_rental')
      .select(`
        *,
        buyer:buyer_id(id, email, user_metadata),
        service:service_id(id, title)
      `)
      .in('service_id', serviceIds);
    
    if (rentalsError) throw rentalsError;
    
    // Xử lý dữ liệu để thêm tên người thuê và tên dịch vụ
    const formattedData = rentals?.map(item => ({
      ...item,
      buyer_name: item.buyer?.user_metadata?.fullName || 'Chưa có tên',
      service_title: item.service?.title || 'Chưa có tiêu đề'
    }));
    
    return formattedData || [];
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn thuê cho dịch vụ của bạn:', error);
    return [];
  }
};

/**
 * Kiểm tra xem khoảng thời gian có sẵn không
 */
export const checkTimeSlotAvailability = async (serviceId: string, timeSlots: string[]) => {
  try {
    // Lấy danh sách đơn thuê đã được xác nhận cho dịch vụ này
    const { data: confirmedRentals, error: rentalsError } = await supabase
      .from('service_rental')
      .select('selected_time_slots')
      .eq('service_id', serviceId)
      .in('status', ['approved', 'in_progress']);
    
    if (rentalsError) throw rentalsError;
    
    if (!confirmedRentals || confirmedRentals.length === 0) {
      return { available: true, conflicts: [] };
    }
    
    // Tìm các khoảng thời gian đã được đặt
    const bookedTimeSlots = confirmedRentals.flatMap(rental => {
      if (typeof rental.selected_time_slots === 'string') {
        try {
          return JSON.parse(rental.selected_time_slots);
        } catch (err) {
          return [];
        }
      }
      return rental.selected_time_slots?.slots || rental.selected_time_slots?.days || [];
    });
    
    // Kiểm tra xem có xung đột không
    const conflicts = timeSlots.filter(slot => bookedTimeSlots.includes(slot));
    
    return {
      available: conflicts.length === 0,
      conflicts
    };
  } catch (error) {
    console.error('Lỗi khi kiểm tra tính khả dụng của khoảng thời gian:', error);
    return { available: false, error: 'Đã xảy ra lỗi khi kiểm tra' };
  }
};

/**
 * Lấy danh sách đơn thuê dịch vụ cho các dịch vụ của người dùng hiện tại với phân trang
 */
export const getRentalsForMyServicesWithPagination = async (page = 1, limit = 10, filter?: IServiceRentalFilter) => {
  try {
    // Lấy thông tin người dùng hiện tại
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error('Không có phiên đăng nhập');
    }
    
    const userId = session.session.user.id;
    
    // Lấy danh sách dịch vụ của người dùng
    const { data: myServices, error: servicesError } = await supabase
      .from('item')
      .select('id')
      .eq('owner_id', userId)
      .eq('item_type', 'service');
    
    if (servicesError) throw servicesError;
    
    if (!myServices || myServices.length === 0) {
      return { data: [], count: 0 };
    }
    
    // Lấy danh sách ID của các dịch vụ
    const serviceIds = myServices.map(service => service.id);
    
    // Tính toán phân trang
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    
    // Lấy danh sách đơn thuê dịch vụ cho các dịch vụ của người dùng với phân trang
    let query = supabase
      .from('service_rental')
      .select(`
        *,
        buyer:buyer_id(id, email, user_metadata),
        service:service_id(id, title)
      `)
      .in('service_id', serviceIds);
    
    if (filter?.status) {
      query = query.eq('status', filter.status);
    }
    
    const { data: rentals, error: rentalsError } = await query.range(start, end);
    
    if (rentalsError) throw rentalsError;
    
    // Lấy tổng số bản ghi
    let countQuery = supabase
      .from('service_rental')
      .select('*', { count: 'exact', head: true })
      .in('service_id', serviceIds);
    
    if (filter?.status) {
      countQuery = countQuery.eq('status', filter.status);
    }
    
    const { data: countData, error: countError } = await countQuery;
    
    if (countError) throw countError;
    
    // Xử lý dữ liệu để thêm tên người thuê và tên dịch vụ
    const formattedData = rentals?.map(item => ({
      ...item,
      buyer_name: item.buyer?.user_metadata?.fullName || 'Chưa có tên',
      service_title: item.service?.title || 'Chưa có tiêu đề'
    }));
    
    return {
      data: formattedData || [],
      count: countData?.length || 0
    };
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn thuê cho dịch vụ của bạn:', error);
    return { data: [], count: 0 };
  }
};

export const updateServiceRentalById = async (id: string, updateData: Partial<IServiceRentalInput>) => {
  try {
    const { data, error } = await supabase
      .from('service_rental')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error(`Error updating service rental with ID ${id}:`, error);
    return null;
  }
};

export const getAllServiceRentalByServiceId = async (serviceId: string) => {
  try {
    const { data, error } = await supabase
      .from('service_rental')
      .select(`*, buyer:buyer_id(*)`)
      .eq('service_id', serviceId);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching service rentals for service ID ${serviceId}:`, error);
    return [];
  }
};

export const getAllServiceRentalByServiceIdCSV = async (serviceId: string) => {
  try {
    const { data, error } = await supabase
      .from('service_rental')
      .select(`*, buyer:buyer_id(*)`)
      .eq('service_id', serviceId);
    
    if (error) throw error;
    
    // Format data for CSV export
    return data.map((rental: any) => ({
      id: rental.id,
      status: rental.status,
      buyer_name: rental.buyer?.user_metadata?.fullName || 'N/A',
      buyer_email: rental.buyer?.email || 'N/A',
      created_at: rental.created_at,
      // Add other fields as needed
    }));
  } catch (error) {
    console.error(`Error fetching service rentals for CSV export:`, error);
    return [];
  }
};

export const getMyRentedServices = async (buyerId: string) => {
  try {
    const { data, error } = await supabase
      .from('service_rental')
      .select(`
        *,
        service:service_id (
          id,
          title,
          description,
          image_urls,
          price_range
        )
      `)
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [] };
  } catch (error) {
    console.error('Lỗi khi lấy danh sách dịch vụ đã thuê:', error);
    throw error;
  }
};
