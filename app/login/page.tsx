import { login, signup } from './actions'

export default async function LoginPage(props: { searchParams: Promise<{ message: string }> }) {
  const searchParams = await props.searchParams;
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto min-h-screen">
      <form className="animate-in flex-1 flex flex-col w-full justify-center gap-4 text-foreground">
        <h1 className="text-3xl font-bold mb-6 text-center">Acceso AXIS</h1>
        
        <div className="flex flex-col gap-2">
          <label className="text-md" htmlFor="fullName">
            Nombre Completo (solo para registro)
          </label>
          <input
            className="rounded-md px-4 py-2 bg-inherit border mb-2"
            name="fullName"
            placeholder="Juan Pérez"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-md" htmlFor="email">
            Email
          </label>
          <input
            className="rounded-md px-4 py-2 bg-inherit border mb-2"
            name="email"
            placeholder="tu@email.com"
            required
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-md" htmlFor="password">
            Contraseña
          </label>
          <input
            className="rounded-md px-4 py-2 bg-inherit border mb-2"
            type="password"
            name="password"
            placeholder="••••••••"
            required
          />
        </div>
        
        <div className="flex gap-2 mt-4">
          <button
            formAction={login}
            className="bg-blue-600 text-white rounded-md px-4 py-2 w-full hover:bg-blue-700 transition"
          >
            Iniciar Sesión
          </button>
          <button
            formAction={signup}
            className="bg-gray-800 text-white rounded-md px-4 py-2 w-full hover:bg-gray-900 transition"
          >
            Registrarse
          </button>
        </div>
        
        {searchParams?.message && (
          <p className="mt-4 p-4 bg-red-100 text-red-700 text-center rounded-md">
            {searchParams.message}
          </p>
        )}
      </form>
    </div>
  )
}
