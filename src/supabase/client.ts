import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pabomqopgvaekbrblcnk.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhYm9tcW9wZ3ZhZWticmJsY25rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDkxMDYzMSwiZXhwIjoyMDYwNDg2NjMxfQ.DIZ1ykCjhDfx8zT2FUYm-E3snI4YxaZxsdhuvYmAm5I'

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Thiếu thông tin cấu hình Supabase. Vui lòng kiểm tra biến môi trường.')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Kiểm tra kết nối và trạng thái xác thực
const checkConnection = async () => {
  try {
    // Kiểm tra kết nối cơ bản
    const { data: connectionTest, error: connectionError } = await supabase
      .from('item')
      .select('count')
      .limit(1)
      .single();

    if (connectionError) {
      console.error('Lỗi kết nối Supabase:', connectionError.message);
      return false;
    }

    // Kiểm tra session hiện tại
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Lỗi kiểm tra session:', sessionError.message);
      return false;
    }

    console.log('Kết nối Supabase thành công!', {
      hasConnection: !!connectionTest,
      hasSession: !!session
    });

    return true;
  } catch (error: unknown) {
    console.error('Lỗi không xác định:', error);
    return false;
  }
};

// Thực hiện kiểm tra kết nối
checkConnection(); 