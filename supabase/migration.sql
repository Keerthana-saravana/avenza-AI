-- Database Migration SQL Schema for Avenza AI
-- Suitable for PostgreSQL and Supabase PostgreSQL

-- Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- 1. Users Table (matches auth.users or local emulation)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Businesses Table
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  category text not null, -- Boutique & Fashion Store, Home Bakery, Beauty Salon
  type text[] default '{}'::text[] not null, -- ready_stock, made_order, appointment
  description text,
  address text,
  phone text,
  email text,
  instagram text,
  website text,
  upi_id text,
  working_hours text,
  logo_url text,
  gst_number text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Products Table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  owner_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  category text not null,
  price numeric not null check (price >= 0),
  description text,
  image_url text,
  stock integer not null default 0,
  sku text not null,
  custom_fields jsonb default '{}'::jsonb,
  status text not null default 'In Stock', -- In Stock, Low Stock, Out of Stock
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Customers Table
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  owner_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  phone text not null,
  email text,
  address text,
  notes text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Orders Table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  owner_id uuid references public.users(id) on delete cascade not null,
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text not null,
  total numeric not null default 0 check (total >= 0),
  status text not null default 'Pending', -- Pending, Processing, Completed, Cancelled
  payment_method text not null, -- UPI, Card, Cash, WhatsApp Pay
  invoice_no text not null,
  date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Order Items Table
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  business_id uuid references public.businesses(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null default 1 check (quantity > 0),
  price numeric not null check (price >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Invoices Table
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  business_id uuid references public.businesses(id) on delete cascade not null,
  customer_name text not null,
  invoice_no text not null,
  date date not null default current_date,
  discount numeric default 0,
  gst_amount numeric default 0,
  total_amount numeric not null check (total_amount >= 0),
  status text not null default 'Unpaid', -- Paid, Unpaid
  pdf_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Payments Table
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade not null,
  customer_name text not null,
  amount numeric not null check (amount >= 0),
  status text not null default 'Pending', -- Success, Failed, Pending
  method text not null, -- UPI, Card, Cash
  date date not null default current_date,
  upi_id text,
  txn_id text not null unique,
  provider text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Appointments Table
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  owner_id uuid references public.users(id) on delete cascade not null,
  customer_name text not null,
  service_name text not null,
  date date not null,
  time text not null,
  status text not null default 'Upcoming', -- Upcoming, Completed, Cancelled
  price numeric not null check (price >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Inventory Log Table
create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  quantity_changed integer not null,
  type text not null, -- stock_in, stock_out
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Conversations Table
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  session_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. Messages Table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  business_id uuid references public.businesses(id) on delete cascade not null,
  sender text not null, -- customer, assistant, system
  text text not null,
  products jsonb default '[]'::jsonb,
  invoice jsonb,
  payment_qr text,
  payment_success boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. Settings Table
create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade not null,
  key text not null,
  value jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (business_id, key)
);


-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable Row Level Security on all tables

alter table public.users enable row level security;
alter table public.businesses enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.appointments enable row level security;
alter table public.inventory enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.settings enable row level security;

-- Policies:

-- Users: Read/write own profile only
create policy users_self_policy on public.users
  for all using (auth.uid() = id);

-- Businesses: Read/write owned business only
create policy businesses_owner_policy on public.businesses
  for all using (auth.uid() = owner_id);

-- Products: Read/write products belonging to own business
create policy products_business_policy on public.products
  for all using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

-- Customers: Read/write customers belonging to own business
create policy customers_business_policy on public.customers
  for all using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

-- Orders: Read/write orders belonging to own business
create policy orders_business_policy on public.orders
  for all using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

-- Order Items: Read/write order items belonging to own business
create policy order_items_business_policy on public.order_items
  for all using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

-- Invoices: Read/write invoices belonging to own business
create policy invoices_business_policy on public.invoices
  for all using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

-- Payments: Read/write payments belonging to own business
create policy payments_business_policy on public.payments
  for all using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

-- Appointments: Read/write appointments belonging to own business
create policy appointments_business_policy on public.appointments
  for all using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

-- Inventory: Read/write inventory logs belonging to own business
create policy inventory_business_policy on public.inventory
  for all using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

-- Conversations: Read/write conversations belonging to own business
create policy conversations_business_policy on public.conversations
  for all using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

-- Messages: Read/write messages belonging to own business
create policy messages_business_policy on public.messages
  for all using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

-- Settings: Read/write settings belonging to own business
create policy settings_business_policy on public.settings
  for all using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );


-- TRIGGERS FOR UPDATED_AT COLUMN
-- Create automatic updated_at timestamp function

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply triggers
create trigger set_updated_at before update on public.businesses
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.products
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.customers
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.orders
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.invoices
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.payments
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.appointments
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.settings
  for each row execute function public.handle_updated_at();
