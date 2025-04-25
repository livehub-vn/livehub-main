-- ENUMS
CREATE TYPE item_type AS ENUM ('service', 'demand');
CREATE TYPE status_type AS ENUM ('pending', 'approved', 'rejected', 'open', 'closed', 'in_progress', 'cancelled');
-- TABLES
create table post ( 
    id uuid not null default gen_random_uuid() primary key,
    post_type item_type not null, -- 'service' or 'demand'
    title text not null,
    image_urls text[] not null, -- Array of image URLs (e.g., in Supabase Storage)
    description text,
    price_range jsonb not null, -- JSONB for flexible price range storage
    category text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table item ( 
    id uuid not null default gen_random_uuid() primary key,
    title text not null,
    description text,
    price_range jsonb not null, -- {max: 100, min: 10, currency: 'VND'}
    date_range jsonb not null, -- {type: 'date', start: '2023-10-01', end: '2023-10-31'} or {type: 'week_days', days: ['mon', 'wed', 'fri']}
    item_type item_type not null, -- 'service' or 'demand'
    -- ##demand_item
    previous_experience text, -- Previous experience in the field
    expected_price_range jsonb, -- {max: 100, min: 10, currency: 'VND'} <-- Made nullable
    -- ##end_demand_item
    -- mutual
    owner_id uuid not null references auth.users(id) on delete cascade,
    contact_info jsonb not null, -- {contacts: [{platform: "", value: ""}]}
    status status_type not null default 'pending',
    category text,
    need_support boolean not null default false,
    note text, -- Notes from admin during verification
    image_urls text[] not null, -- Array of image URLs (e.g., in Supabase Storage)
    post_id uuid references post(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table service_rental (
    id uuid not null default gen_random_uuid() primary key,
    note text, -- <-- Made nullable
    buyer_id uuid not null references auth.users(id) on delete cascade,
    service_id uuid not null references item(id) on delete cascade,
    status status_type not null default 'pending',
    selected_time_slots jsonb not null, -- JSONB for selected time slots
    expect_price_range jsonb not null, -- JSONB for expected price range
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table demand_application ( 
    id uuid not null default gen_random_uuid() primary key,
    demand_id uuid not null references item(id) on delete cascade,
    supplier_id uuid not null references auth.users(id) on delete cascade,
    status status_type not null default 'pending',
    promote_text text, -- Text to promote the demand
    image_urls text[] not null, -- Array of image URLs (e.g., in Supabase Storage)
    note text, -- Notes from admin during verification
    contact_info jsonb not null, -- {contacts: [{platform: "", value: ""}]}
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create service table
CREATE TABLE IF NOT EXISTS public.service (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price_range JSONB NOT NULL,
    category VARCHAR(100),
    owner_id UUID NOT NULL REFERENCES auth.users(id),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create service_application table
CREATE TABLE IF NOT EXISTS public.service_application (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES public.service(id),
    buyer_id UUID NOT NULL REFERENCES auth.users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    note TEXT,
    contact_info JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(service_id, buyer_id)
);

-- Create RLS policies for service table
ALTER TABLE public.service ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.service
    FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.service
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for service owners" ON public.service
    FOR UPDATE
    USING (auth.uid() = owner_id);

-- Create RLS policies for service_application table
ALTER TABLE public.service_application ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for service owners and applicants" ON public.service_application
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT owner_id FROM public.service WHERE id = service_id
            UNION
            SELECT buyer_id FROM public.service_application WHERE id = id
        )
    );

CREATE POLICY "Enable insert for authenticated users" ON public.service_application
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for service owners" ON public.service_application
    FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT owner_id FROM public.service WHERE id = service_id
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_owner ON public.service(owner_id);
CREATE INDEX IF NOT EXISTS idx_service_status ON public.service(status);
CREATE INDEX IF NOT EXISTS idx_service_application_service ON public.service_application(service_id);
CREATE INDEX IF NOT EXISTS idx_service_application_buyer ON public.service_application(buyer_id);
CREATE INDEX IF NOT EXISTS idx_service_application_status ON public.service_application(status);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER handle_service_updated_at
    BEFORE UPDATE ON public.service
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_service_application_updated_at
    BEFORE UPDATE ON public.service_application
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
