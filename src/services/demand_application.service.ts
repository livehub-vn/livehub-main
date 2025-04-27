import { supabase } from "../supabase/client";
import { IDemandApplicationInput } from './demand.service';

/**
 * Lấy danh sách ứng tuyển theo ID nhu cầu
 */
export const getDemandApplicationsByDemandId = async (demandId: string) => {
  try {
    const { data, error } = await supabase
      .from('demand_application')
      .select(`
        *,
        supplier:supplier_id(id, email, user_metadata),
        demand:demand_id(id, title)
      `)
      .eq('demand_id', demandId);
    
    if (error) throw error;
    
    // Xử lý dữ liệu để thêm tên người ứng tuyển và tên nhu cầu
    const formattedData = data?.map(item => ({
      ...item,
      supplier_name: item.supplier?.user_metadata?.fullName || 'Chưa có tên',
      demand_title: item.demand?.title || 'Chưa có tiêu đề'
    }));
    
    return formattedData || [];
  } catch (error) {
    console.error('Lỗi khi lấy danh sách ứng tuyển:', error);
    return [];
  }
};

/**
 * Lấy ứng tuyển theo ID
 */
export const getDemandApplicationById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('demand_application')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin ứng tuyển:', error);
    return null;
  }
};

/**
 * Tạo ứng tuyển mới
 */
export const createDemandApplication = async (applicationData: IDemandApplicationInput) => {
  try {
    // Lấy thông tin người dùng hiện tại
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error('Không có phiên đăng nhập');
    }
    
    const supplier_id = session.session.user.id;
    
    // Chuẩn bị dữ liệu ứng tuyển
    const newApplication = {
      ...applicationData,
      supplier_id,
      status: 'pending',
      image_urls: applicationData.image_urls || []
    };
    
    const { data, error } = await supabase
      .from('demand_application')
      .insert([newApplication])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Cập nhật ứng tuyển
 */
export const updateDemandApplication = async (id: string, applicationData: Partial<IDemandApplicationInput>) => {
  try {
    // Chuẩn bị dữ liệu cập nhật
    const updateData = { ...applicationData };
    
    const { data, error } = await supabase
      .from('demand_application')
      .update(updateData)
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
 * Xóa ứng tuyển
 */
export const deleteDemandApplication = async (id: string) => {
  try {
    const { error } = await supabase
      .from('demand_application')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    throw error;
  }
};

/**
 * Thay đổi trạng thái ứng tuyển
 */
export const changeDemandApplicationStatus = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
  try {
    const { data, error } = await supabase
      .from('demand_application')
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
 * Tải lên hình ảnh cho ứng tuyển
 */
export const uploadDemandApplicationImage = async (id: string, file: File) => {
  try {
    const filePath = `demand_applications/${id}/${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('item-images')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Lấy URL của file vừa upload
    const { data } = supabase.storage
      .from('item-images')
      .getPublicUrl(filePath);
    
    // Cập nhật danh sách image_urls của ứng tuyển
    const { data: application, error: getError } = await supabase
      .from('demand_application')
      .select('image_urls')
      .eq('id', id)
      .single();
    
    if (getError) throw getError;
    
    const currentImages = application.image_urls || [];
    const updatedImages = [...currentImages, data.publicUrl];
    
    const { error: updateError } = await supabase
      .from('demand_application')
      .update({ image_urls: updatedImages })
      .eq('id', id);
    
    if (updateError) throw updateError;
    
    return { url: data.publicUrl };
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy danh sách ứng tuyển của người dùng hiện tại
 */
export const getMyDemandApplications = async () => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error('Không có phiên đăng nhập');
    }
    
    const supplier_id = session.session.user.id;
    
    const { data, error } = await supabase
      .from('demand_application')
      .select(`
        *,
        demand:demand_id(id, title, owner_id)
      `)
      .eq('supplier_id', supplier_id);
    
    if (error) throw error;
    
    // Xử lý dữ liệu để thêm tên nhu cầu
    const formattedData = data?.map(item => ({
      ...item,
      demand_title: item.demand?.title || 'Chưa có tiêu đề'
    }));
    
    return formattedData || [];
  } catch (error) {
    console.error('Lỗi khi lấy danh sách ứng tuyển của tôi:', error);
    return [];
  }
};

/**
 * Lấy danh sách ứng tuyển cho nhu cầu của người dùng hiện tại
 */
export const getApplicationsForMyDemands = async () => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error('Không có phiên đăng nhập');
    }
    
    const owner_id = session.session.user.id;
    
    // Trước tiên lấy tất cả nhu cầu của người dùng
    const { data: myDemands, error: demandsError } = await supabase
      .from('item')
      .select('id')
      .eq('owner_id', owner_id)
      .eq('item_type', 'demand');
    
    if (demandsError) throw demandsError;
    
    if (!myDemands || myDemands.length === 0) {
      return [];
    }
    
    // Lấy tất cả ứng tuyển cho các nhu cầu này
    const demandIds = myDemands.map(demand => demand.id);
    
    const { data, error } = await supabase
      .from('demand_application')
      .select(`
        *,
        supplier:supplier_id(id, email, user_metadata),
        demand:demand_id(id, title)
      `)
      .in('demand_id', demandIds);
    
    if (error) throw error;
    
    // Xử lý dữ liệu để thêm tên người ứng tuyển và tên nhu cầu
    const formattedData = data?.map(item => ({
      ...item,
      supplier_name: item.supplier?.user_metadata?.fullName || 'Chưa có tên',
      demand_title: item.demand?.title || 'Chưa có tiêu đề'
    }));
    
    return formattedData || [];
  } catch (error) {
    console.error('Lỗi khi lấy danh sách ứng tuyển cho nhu cầu của tôi:', error);
    return [];
  }
};
