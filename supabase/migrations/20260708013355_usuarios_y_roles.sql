-- 1. Creamos un tipo ENUM para los roles principales
CREATE TYPE public.user_role AS ENUM ('admin', 'staff');

-- 2. Creamos la tabla de perfiles (nuestra extensión de auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role public.user_role NOT NULL DEFAULT 'staff',
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Creamos un tipo ENUM con los módulos que pide tu briefing
CREATE TYPE public.app_module AS ENUM (
  'dashboard', 'clientes', 'vehiculos', 'presupuestos', 
  'ordenes_trabajo', 'vista_taller', 'stock_repuestos', 
  'stock_insumos', 'compras', 'configuracion', 'logs'
);

-- 4. Creamos la tabla de permisos granulares (clave para los mecánicos/administrativos)
CREATE TABLE public.user_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  module public.app_module NOT NULL,
  can_read BOOLEAN NOT NULL DEFAULT false,
  can_write BOOLEAN NOT NULL DEFAULT false,
  
  -- Restricción para que no haya permisos duplicados por módulo para un mismo usuario
  UNIQUE(user_id, module)
);

-- 5. Habilitamos Row Level Security (RLS) por seguridad
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
