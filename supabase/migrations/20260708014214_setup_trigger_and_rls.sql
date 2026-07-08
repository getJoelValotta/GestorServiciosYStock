-- ==========================================
-- 1. FUNCIÓN AUXILIAR PARA RLS (MODO DIOS)
-- ==========================================
-- ¿Por qué hacemos esto? Si intentamos leer la tabla `profiles` adentro de una 
-- política de la misma tabla `profiles` para saber si sos admin, Postgres entra 
-- en un bucle infinito (recursividad). Con "SECURITY DEFINER", esta función se 
-- ejecuta saltándose el RLS temporalmente solo para revisar tu rol.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ==========================================
-- 2. POLÍTICAS RLS (Row Level Security)
-- ==========================================

-- Para la tabla PROFILES:
-- A) Cualquiera puede ver su propio perfil
CREATE POLICY "Los usuarios ven su propio perfil" 
  ON public.profiles FOR SELECT 
  USING ( auth.uid() = id );

-- B) Los admins pueden ver a TODOS los perfiles
CREATE POLICY "Admins ven todos los perfiles" 
  ON public.profiles FOR SELECT 
  USING ( public.is_admin() );

-- C) Los admins pueden editar roles o nombres de otros
CREATE POLICY "Admins editan perfiles" 
  ON public.profiles FOR UPDATE 
  USING ( public.is_admin() );

-- Para la tabla USER_PERMISSIONS:
-- A) Un mecánico puede ver qué permisos le habilitaron
CREATE POLICY "Los usuarios ven sus propios permisos" 
  ON public.user_permissions FOR SELECT 
  USING ( user_id = auth.uid() );

-- B) El admin puede crear, editar y borrar todos los permisos
CREATE POLICY "Admins tienen control total de permisos" 
  ON public.user_permissions FOR ALL 
  USING ( public.is_admin() );


-- ==========================================
-- 3. EL TRIGGER MÁGICO (Automatización)
-- ==========================================
-- Esta función captura el evento de registro de Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Inserta en nuestra tabla profiles usando el ID del usuario recién creado
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    -- Intentamos sacar el nombre del frontend, si no viene, ponemos un default
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario Nuevo'),
    -- Por seguridad, todo usuario nuevo nace siendo 'staff'
    'staff'
  );
  RETURN NEW;
END;
$$;

-- Enganchamos la función a la tabla auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
