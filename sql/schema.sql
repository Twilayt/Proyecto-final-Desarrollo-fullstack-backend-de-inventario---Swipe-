
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('admin','user')) default 'user',
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text,
  email text,
  direccion text,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  nombre text not null,
  categoria text not null,
  descripcion text,
  presentacion text,
  precio numeric(10,2) not null default 0 check (precio >= 0),
  stock int not null default 0 check (stock >= 0),
  fecha_caducidad date,
  created_at timestamptz not null default now()
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  user_id uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  total numeric(10,2) not null default 0 check (total >= 0)
);

create table if not exists public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  cantidad int not null check (cantidad > 0),
  precio_unit numeric(10,2) not null check (precio_unit >= 0)
);

create index if not exists idx_products_nombre on public.products using btree (nombre);
create index if not exists idx_products_sku on public.products using btree (sku);
create index if not exists idx_products_caducidad on public.products using btree (fecha_caducidad);
create index if not exists idx_sales_client on public.sales using btree (client_id);
