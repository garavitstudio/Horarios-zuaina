import Link from "next/link";

export default function AdministrarPage() {
  const sections = [
    {
      href: "/administrar/trabajadores",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
      title: "Gestionar trabajadores",
      desc: "Editar datos, horarios y activar o desactivar trabajadores",
      accent: "#7A3FA0",
      bg: "#EEE0F8",
    },
    {
      href: "/administrar/festivos",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      title: "Gestionar festivos",
      desc: "Ver, añadir, editar y eliminar los días festivos por año",
      accent: "#18A7E0",
      bg: "#D6EAF7",
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#F5F5F5" }}>
      <header style={{ background: "#18A7E0" }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/"
            className="p-1.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-white">Administrar</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10 animate-fade-in">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#1F1A24" }}>
            ¿Qué quieres administrar?
          </h2>
          <p className="text-sm" style={{ color: "#6B7280" }}>
            Gestiona los datos de la asociación desde aquí
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((s, i) => (
            <Link
              key={s.href}
              href={s.href}
              className="group block rounded-2xl p-8 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 animate-fade-in"
              style={{ background: "white", animationDelay: `${i * 0.1}s`, textDecoration: "none" }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: s.bg, color: s.accent }}>
                {s.icon}
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "#1F1A24" }}>{s.title}</h3>
              <p className="text-sm" style={{ color: "#6B7280" }}>{s.desc}</p>
              <div className="mt-4 text-sm font-medium" style={{ color: s.accent }}>Ir →</div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
