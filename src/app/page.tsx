import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const menuItems = [
    {
      href: "/trabajadores/nuevo",
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
        </svg>
      ),
      title: "Añadir nuevo trabajador",
      desc: "Registra un nuevo trabajador y configura su horario semanal",
      accent: "#7A3FA0",
      bg: "#EEE0F8",
    },
    {
      href: "/horarios",
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      title: "Sacar horarios",
      desc: "Genera y descarga las hojas de horario anuales en PDF",
      accent: "#E93A8A",
      bg: "#FCE4F0",
    },
    {
      href: "/administrar",
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "Administrar",
      desc: "Gestiona trabajadores y festivos de la asociación",
      accent: "#18A7E0",
      bg: "#D6EAF7",
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#F5F5F5" }}>
      {/* Header */}
      <header className="shadow-sm" style={{ background: "#7A3FA0" }}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#F2EA00" }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#1F1A24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-white text-sm leading-none">Zuaina Horarios</h1>
              <p className="text-xs mt-0.5" style={{ color: "#D6EAF7" }}>Asociación La Vida es Zuaina</p>
            </div>
          </div>
          <form action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}>
            <button
              type="submit"
              className="text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer hover:bg-white/20"
              style={{ background: "rgba(255,255,255,0.15)", color: "white" }}>
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl font-bold mb-2" style={{ color: "#1F1A24" }}>
            ¿Qué quieres hacer hoy?
          </h2>
          <p className="text-base" style={{ color: "#6B7280" }}>
            Selecciona una opción para comenzar
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {menuItems.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="group block rounded-2xl p-8 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 animate-fade-in"
              style={{
                background: "white",
                animationDelay: `${i * 0.1}s`,
                textDecoration: "none",
              }}
            >
              <div className="w-18 h-18 rounded-2xl flex items-center justify-center mb-6 transition-colors"
                style={{ background: item.bg, color: item.accent, width: "72px", height: "72px" }}>
                {item.icon}
              </div>
              <h3 className="text-lg font-bold mb-2 transition-colors"
                style={{ color: "#1F1A24" }}>
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>
                {item.desc}
              </p>
              <div className="mt-5 flex items-center gap-1 text-sm font-medium transition-colors"
                style={{ color: item.accent }}>
                Ir →
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
