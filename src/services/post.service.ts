import { supabase } from "../supabase/client";

// Định nghĩa các kiểu dữ liệu
export interface IPost {
  id?: string;
  item_id: string; // ID của dịch vụ hoặc nhu cầu
  post_content: string; // Nội dung bài đăng (Markdown/HTML)
  item_type: 'service' | 'demand'; // Loại bài đăng
  is_public: boolean; // Hiển thị công khai hay không
  image_urls: string[]; // Hình ảnh đính kèm
  created_at?: Date;
  updated_at?: Date;
}

// API calls sử dụng Supabase
/**
 * Lấy bài đăng theo ID của dịch vụ hoặc nhu cầu
 */
export const getPostByItemId = async (itemId: string) => {
  try {
    const { data, error } = await supabase
      .from('post')
      .select('*')
      .eq('item_id', itemId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
};

/**
 * Tạo hoặc cập nhật bài đăng
 */
export const createOrUpdatePost = async (postData: IPost) => {
  try {
    // Kiểm tra xem bài đăng đã tồn tại chưa
    const { data: existingPost } = await supabase
      .from('post')
      .select('id')
      .eq('item_id', postData.item_id)
      .single();
    
    if (existingPost) {
      // Cập nhật bài đăng hiện có
      const { data, error } = await supabase
        .from('post')
        .update({
          post_content: postData.post_content,
          is_public: postData.is_public,
          image_urls: postData.image_urls,
          updated_at: new Date()
        })
        .eq('id', existingPost.id)
        .select();
      
      if (error) throw error;
      return data;
    } else {
      // Tạo bài đăng mới
      const { data, error } = await supabase
        .from('post')
        .insert({
          ...postData,
          created_at: new Date(),
          updated_at: new Date()
        })
        .select();
      
      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error creating/updating post:', error);
    throw error;
  }
};

/**
 * Upload hình ảnh cho bài đăng
 */
export const uploadPostImage = async (file: File, path: string = 'posts') => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Xóa bài đăng
 */
export const deletePost = async (postId: string) => {
  try {
    const { error } = await supabase
      .from('post')
      .delete()
      .eq('id', postId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

/**
 * Lấy danh sách bài đăng công khai
 */
export const getPublicPosts = async (page = 1, limit = 10, itemType?: 'service' | 'demand') => {
  try {
    let query = supabase
      .from('post')
      .select('*, item:item_id(*)')
      .eq('is_public', true);
    
    if (itemType) {
      query = query.eq('item_type', itemType);
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching public posts:', error);
    throw error;
  }
};
