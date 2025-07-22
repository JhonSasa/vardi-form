// src/app/page.tsx
export default function Home() {
  return (
    <main className="p-8 text-center">
      <h1 className="text-2xl font-bold">Bienvenido a Vardi</h1>
      <p>
        Ve al formulario en{' '}
        <a href="/actualizacion" className="text-blue-600 underline">
          /actualizacion
        </a>
      </p>
    </main>
  )
}