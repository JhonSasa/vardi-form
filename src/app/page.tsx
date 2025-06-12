// src/app/page.tsx
export default function Home() {
  return (
    <main className="p-8 text-center">
      <h1 className="text-2xl font-bold">Bienvenido a Vardi</h1>
      <p>
        Ve al formulario en{' '}
        <a href="/vardi-form" className="text-blue-600 underline">
          /vardi-form
        </a>
      </p>
    </main>
  )
}