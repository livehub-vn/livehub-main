import { supabase } from '../supabase/client';

export interface IServiceApplication {
  id?: string;
  service_id: string;
  buyer_id: string;
  status: 'pending' | 'approved' | 'rejected';
  note?: string;
  contact_info: {
    name: string;
    phone: string;
    email: string;
  };
  created_at?: string;
  updated_at?: string;
}

export const createServiceApplication = async (application: Omit<IServiceApplication, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    // Log input data
    console.log('Creating service application with data:', JSON.stringify(application, null, 2));

    // Validate required fields
    if (!application.service_id) {
      throw new Error('Thiếu service_id');
    }
    if (!application.buyer_id) {
      throw new Error('Thiếu buyer_id');
    }
    if (!application.contact_info) {
      throw new Error('Thiếu thông tin liên hệ');
    }

    // Check if service exists
    console.log('Checking service existence with ID:', application.service_id);
    
    const { data: serviceExists, error: serviceError } = await supabase
      .from('service')
      .select('id')
      .eq('id', application.service_id)
      .single();

    if (serviceError) {
      console.error('Service check error:', {
        error: serviceError,
        message: serviceError.message,
        details: serviceError.details,
        hint: serviceError.hint
      });
      throw new Error(`Dịch vụ không tồn tại: ${serviceError.message}`);
    }

    if (!serviceExists) {
      console.error('Service not found for ID:', application.service_id);
      throw new Error('Dịch vụ không tồn tại hoặc đã bị xóa');
    }

    // Check if user exists
    const { data: userExists, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', application.buyer_id)
      .single();

    if (userError || !userExists) {
      console.error('User check error:', userError);
      throw new Error('Người dùng không tồn tại');
    }

    // Check if application already exists
    const { data: existingApplication } = await supabase
      .from('service_application')
      .select('id')
      .eq('service_id', application.service_id)
      .eq('buyer_id', application.buyer_id)
      .single();

    if (existingApplication) {
      throw new Error('Bạn đã đăng ký dịch vụ này rồi');
    }

    // Create application
    const { data, error } = await supabase
      .from('service_application')
      .insert([
        {
          ...application,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      throw new Error(error.message);
    }

    console.log('Service application created successfully:', data);
    return data;
  } catch (error: any) {
    console.error('Service application creation error:', {
      error,
      message: error.message,
      stack: error.stack
    });
    
    // Throw a more specific error message
    if (error.code === '23503') {
      throw new Error('Dịch vụ hoặc người dùng không tồn tại');
    } else if (error.code === '23505') {
      throw new Error('Bạn đã đăng ký dịch vụ này rồi');
    } else if (error.message) {
      throw new Error(`Lỗi khi tạo đơn đăng ký: ${error.message}`);
    } else {
      throw new Error('Có lỗi xảy ra khi tạo đơn đăng ký');
    }
  }
};

export const getServiceApplicationsByBuyerId = async (buyerId: string) => {
  try {
    const { data, error } = await supabase
      .from('service_application')
      .select(`
        *,
        service:service_id (
          title,
          description,
          price_range,
          category
        )
      `)
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error fetching service applications:', error);
    throw new Error(`Không thể lấy danh sách đơn đăng ký: ${error.message}`);
  }
};

export const getServiceApplicationsByServiceId = async (serviceId: string) => {
  try {
    const { data, error } = await supabase
      .from('service_application')
      .select(`
        *,
        buyer:buyer_id (
          id,
          metadata
        )
      `)
      .eq('service_id', serviceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error fetching service applications:', error);
    throw new Error(`Không thể lấy danh sách đơn đăng ký: ${error.message}`);
  }
};

export const updateServiceApplicationStatus = async (applicationId: string, status: 'approved' | 'rejected') => {
  try {
    const { data, error } = await supabase
      .from('service_application')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error updating service application status:', error);
    throw new Error(`Không thể cập nhật trạng thái đơn đăng ký: ${error.message}`);
  }
}; 