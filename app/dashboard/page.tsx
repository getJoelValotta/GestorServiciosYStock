import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { signout } from '../login/actions'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Obtener la sesión actual
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Traer el perfil del usuario (Dispara RLS)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 3. Traer permisos del usuario (Dispara RLS)
  const { data: permissions } = await supabase
    .from('user_permissions')
    .select('*')
    .eq('user_id', user.id)

  return (
    <div className="flex-1 w-full flex flex-col gap-8 items-center p-8">
      <div className="w-full max-w-4xl flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold">AXIS Dashboard</h1>
        <form action={signout}>
          <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition">
            Cerrar Sesión
          </button>
        </form>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border p-6 rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-bold mb-4">Perfil del Usuario</h2>
          <div className="flex flex-col gap-2 text-gray-700">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Nombre:</strong> {profile?.full_name || 'Cargando...'}</p>
            <p>
              <strong>Rol:</strong>{' '}
              <span className={`px-2 py-1 rounded text-sm font-bold ${profile?.role === 'admin' ? 'bg-purple-200 text-purple-800' : 'bg-green-200 text-green-800'}`}>
                {profile?.role || 'staff'}
              </span>
            </p>
          </div>
        </div>

        <div className="border p-6 rounded-lg shadow-sm bg-white">
          <h2 className="text-xl font-bold mb-4">Módulos Habilitados</h2>
          {permissions && permissions.length > 0 ? (
            <ul className="space-y-2">
              {permissions.map((perm) => (
                <li key={perm.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="font-medium capitalize">{perm.module}</span>
                  <div className="flex gap-2 text-xs">
                    {perm.can_read && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Ver</span>}
                    {perm.can_write && <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">Modificar</span>}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500 italic p-4 bg-gray-50 rounded text-center">
              No tienes ningún módulo asignado todavía.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
