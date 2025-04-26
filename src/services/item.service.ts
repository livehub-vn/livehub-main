import { supabase } from "../supabase/client";
import { ItemType } from "../types/Item";

export const getItemsByType = async (type: ItemType, range: number[]) => {
    console.log(`Đang tìm kiếm item theo loại: ${type} với range: ${range}`);
    const { data, error } = await supabase.from('item').select('*').eq('item_type', type).range(range[0], range[1]);
    
    if (error) {
        console.error('Error fetching items:', error);
        return [];
    }
    
    console.log(`Đã tìm thấy ${data?.length || 0} items của loại ${type}`);
    return data || [];
}

export const updateItemById = async (id: string, item: any) => {
    const { data, error } = await supabase.from('item').update(item).eq('id', id);
    if (error) {
        console.error('Error updating item:', error);
        return null;
    }
    return data;
}

export const getAllServices = async () => {
    console.log('Đang lấy tất cả các dịch vụ...');
    const { data, error } = await supabase.from('item').select('*').eq('item_type', 'service');
    
    if (error) {
        console.error('Error fetching services:', error);
        return [];
    }
    
    console.log(`Đã tìm thấy ${data?.length || 0} dịch vụ`);
    return data || [];
}

// Lấy danh sách dịch vụ với phân trang và lọc
export const getServices = async (
  page = 1, 
  limit = 10, 
  filter: Record<string, any> = {}
) => {
  const start = (page - 1) * limit;
  const end = start + limit - 1;
  
  console.log(`Đang lấy dịch vụ từ ${start} đến ${end}, với bộ lọc:`, filter);
  
  let query = supabase.from('item')
    .select('*')
    .eq('item_type', 'service');
  
  // Thêm các điều kiện lọc
  if (filter.status) {
    query = query.eq('status', filter.status);
  }
  
  if (filter.category) {
    query = query.eq('category', filter.category);
  }
  
  if (filter.min_price) {
    query = query.gte('price_range->min', filter.min_price);
  }
  
  if (filter.max_price) {
    query = query.lte('price_range->max', filter.max_price);
  }
  
  const { data, error } = await query.range(start, end);
  
  if (error) {
    console.error('Error fetching services with pagination:', error);
    return { data: [], count: 0 };
  }
  
  // Lấy tổng số bản ghi để phân trang
  const { data: countData, error: countError } = await supabase
    .from('item')
    .select('*', { count: 'exact', head: true })
    .eq('item_type', 'service');
  
  if (countError) {
    console.error('Error counting services:', countError);
    return { data: data || [], count: 0 };
  }
  
  return { 
    data: data || [], 
    count: countData?.length || 0
  };
};

// Lấy chi tiết một dịch vụ theo ID
export const getServiceById = async (serviceId: string) => {
  const { data, error } = await supabase
    .from('item')
    .select('*')
    .eq('id', serviceId)
    .eq('item_type', 'service')
    .single();
  
  if (error) {
    console.error(`Error fetching service with ID ${serviceId}:`, error);
    return null;
  }
  
  return data;
};

// Tạo dịch vụ mới
export const createService = async (serviceData: any) => {
  const newService = {
    ...serviceData,
    item_type: 'service',
    status: 'pending'
  };
  
  const { data, error } = await supabase
    .from('item')
    .insert([newService])
    .select();
  
  if (error) {
    console.error('Error creating service:', error);
    return null;
  }
  
  return data?.[0] || null;
};

// Cập nhật dịch vụ
export const updateService = async (serviceId: string, serviceData: any) => {
  const { data, error } = await supabase
    .from('item')
    .update(serviceData)
    .eq('id', serviceId)
    .eq('item_type', 'service')
    .select();
  
  if (error) {
    console.error(`Error updating service with ID ${serviceId}:`, error);
    return null;
  }
  
  return data?.[0] || null;
};

// Xóa dịch vụ
export const deleteService = async (serviceId: string) => {
  const { error } = await supabase
    .from('item')
    .delete()
    .eq('id', serviceId)
    .eq('item_type', 'service');
  
  if (error) {
    console.error(`Error deleting service with ID ${serviceId}:`, error);
    return false;
  }
  
  return true;
};

// Upload hình ảnh cho dịch vụ
export const uploadServiceImages = async (serviceId: string, files: FileList) => {
  try {
    const urls = [];
    
    // Upload từng file và lưu URL
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${serviceId}-${Date.now()}-${i}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('service-images')
        .upload(fileName, file);
      
      if (error) {
        console.error(`Error uploading image ${i}:`, error);
        continue;
      }
      
      // Lấy URL công khai
      const { data: urlData } = supabase.storage
        .from('service-images')
        .getPublicUrl(fileName);
      
      if (urlData?.publicUrl) {
        urls.push(urlData.publicUrl);
      }
    }
    
    return urls;
  } catch (error) {
    console.error(`Error uploading images for service with ID ${serviceId}:`, error);
    return [];
  }
};  

export const deleteItemImage = async (itemId: string, imageUrl: string) => {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split('/');
    const filePath = urlParts[urlParts.length - 1];

    const { error } = await supabase.storage
      .from('public')
      .remove([`items/${itemId}/${filePath}`]);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteItemImage:', error);
    return false;
  }
};  
