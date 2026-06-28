'use client'

import Link from 'next/link'
import FormContacto from '@/components/landing/FormContacto'

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 20V6.5C4 5.67157 4.67157 5 5.5 5H9V20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 20V10.5C9 9.67157 9.67157 9 10.5 9H19.5C20.3284 9 21 9.67157 21 10.5V20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M6.5 8H7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6.5 11H7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6.5 14H7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 13H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15 13H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 16H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15 16H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
}) {
  return (
    <div className="max-w-6xl mx-auto text-center">
      {eyebrow ? (
        <p className="text-sm font-semibold tracking-wide text-blue-200 uppercase">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-white">{title}</h2>
      {subtitle ? <p className="mt-3 text-white/80 max-w-2xl mx-auto">{subtitle}</p> : null}
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-950/10 text-blue-950 flex items-center justify-center border border-blue-950/10">
                <BuildingIcon className="w-6 h-6" />
              </div>
              <div className="leading-tight">
                <p className="text-base sm:text-lg font-extrabold text-blue-950">GRUPO LOZCAM</p>
                <p className="text-xs text-gray-500 -mt-0.5">S.A.C</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-7">
              {[
                { label: 'Inicio', href: '#inicio' },
                { label: 'Servicios', href: '#servicios' },
                { label: 'Proyectos', href: '#proyectos' },
                { label: 'Nosotros', href: '#nosotros' },
                { label: 'Contacto', href: '#contacto' },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm font-semibold text-gray-700 hover:text-blue-950 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition"
              >
                Iniciar sesión
              </Link>
              <Link
                href="#contacto"
                className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#f59e0b] text-gray-900 font-bold text-sm hover:brightness-95 transition filter"
              >
                Solicitar cotización
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <section
          id="inicio"
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #1e3a5f 0%, #0f2440 100%)',
          }}
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#f59e0b]/30 blur-3xl" />
            <div className="absolute -bottom-60 -right-40 w-[28rem] h-[28rem] rounded-full bg-blue-300/20 blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
            <div className="grid lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7">
                <h1 className="text-white text-4xl sm:text-5xl font-extrabold leading-tight">
                  Construimos tu visión con excelencia y precisión
                </h1>
                <p className="mt-5 text-white/80 text-base sm:text-lg max-w-xl">
                  Más de 10 años construyendo sueños en el Perú. <br />
                  Construcción, topografía, arquitectura e instalaciones.
                </p>

                <div className="mt-8 grid sm:grid-cols-3 gap-4">
                  {[
                    { value: '150+', label: 'Proyectos' },
                    { value: '98%', label: 'Satisfacción' },
                    { value: '10+ Años', label: 'Experiencia' },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-4 py-4"
                    >
                      <div className="text-[#f59e0b] text-2xl font-extrabold">{s.value}</div>
                      <div className="text-white/80 text-sm font-semibold mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="#proyectos"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#f59e0b] text-gray-900 font-bold hover:brightness-95 transition"
                  >
                    Ver proyectos
                  </Link>
                  <Link
                    href="#contacto"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/20 text-white font-bold hover:bg-white/10 transition"
                  >
                    Contáctanos
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-3xl bg-white/5 border border-white/10 p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/90 font-bold text-sm">Plataforma de ejecución</p>
                      <p className="text-white/60 text-xs mt-1">Planificación · Topografía · Arquitectura · Instalaciones</p>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-[#f59e0b]/20 border border-[#f59e0b]/40 flex items-center justify-center text-[#f59e0b]">
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 7.5l9-4 9 4-9 4-9-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                        <path d="M3 7.5V16.5L12 20.5L21 16.5V7.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                        <path d="M12 11.5V20.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {[
                      {
                        title: 'Levantamiento y diagnóstico',
                        desc: 'Topografía y análisis para tomar decisiones con precisión.',
                        tag: 'Paso 01',
                      },
                      {
                        title: 'Planificación arquitectónica',
                        desc: 'Diseño, planos y coordinación integral con estándares.',
                        tag: 'Paso 02',
                      },
                      {
                        title: 'Ejecución y control',
                        desc: 'Supervisión continua para cumplir tiempos y calidad.',
                        tag: 'Paso 03',
                      },
                    ].map((x) => (
                      <div key={x.tag} className="rounded-2xl bg-blue-950/30 border border-white/10 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-white text-sm font-extrabold">{x.title}</p>
                            <p className="text-white/70 text-xs mt-1">{x.desc}</p>
                          </div>
                          <span className="shrink-0 text-[#f59e0b] text-xs font-extrabold bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-full px-3 py-1">
                            {x.tag}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl bg-gradient-to-r from-blue-950/40 to-[#f59e0b]/10 border border-white/10 p-4">
                    <p className="text-white/90 text-sm font-bold">¿Listo para cotizar?</p>
                    <p className="text-white/70 text-xs mt-1">Describe tu proyecto y te contactamos a la brevedad.</p>
                    <div className="mt-3">
                      <Link
                        href="#contacto"
                        className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#f59e0b] text-gray-900 font-bold text-sm hover:brightness-95 transition"
                      >
                        Solicitar cotización
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="servicios" className="bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
            <div className="max-w-3xl">
              <p className="text-blue-950/70 font-semibold uppercase tracking-wide text-sm">Servicios</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-blue-950">Soluciones integrales para tu obra</h2>
              <p className="mt-3 text-gray-600">Construcción y soporte técnico para que tu proyecto avance con seguridad y calidad.</p>
            </div>

            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Construcción de viviendas y edificios',
                  desc: 'Ejecución con control de calidad, planificación y acabados profesionales.',
                  icon: (
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 20V9l8-5 8 5v11" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                      <path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    </svg>
                  ),
                },
                {
                  title: 'Topografía y levantamiento de terrenos',
                  desc: 'Mediciones precisas para definir límites, pendientes y condiciones del terreno.',
                  icon: (
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 17l6-6 4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M14 7h7v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M3 21h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  ),
                },
                {
                  title: 'Arquitectura y elaboración de planos',
                  desc: 'Diseño, documentación y coordinación técnica para cumplir requisitos.',
                  icon: (
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 6h12l4 4v12H4V6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                      <path d="M16 6v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                      <path d="M7 14h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M7 17h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  ),
                },
                {
                  title: 'Instalaciones eléctricas y sanitarias',
                  desc: 'Sistemas eficientes con estándares técnicos y pruebas de funcionamiento.',
                  icon: (
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    </svg>
                  ),
                },
                {
                  title: 'Supervisión y consultoría de obras',
                  desc: 'Acompañamiento para asegurar alcance, calidad, cronograma y costos.',
                  icon: (
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 20V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                      <path d="M8 8h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M8 12h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M8 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  ),
                },
                {
                  title: 'Habilitación urbana',
                  desc: 'Preparación de terrenos con criterios de urbanismo y cumplimiento normativo.',
                  icon: (
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 20h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M5 20V9l7-4 7 4v11" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                      <path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    </svg>
                  ),
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="group bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-950/5 border border-blue-950/10 text-blue-950 flex items-center justify-center">
                    <div className="text-[#1e3a5f] group-hover:text-blue-950 transition-colors">{card.icon}</div>
                  </div>
                  <h3 className="mt-4 text-lg font-extrabold text-blue-950">{card.title}</h3>
                  <p className="mt-2 text-gray-600 text-sm leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#1e3a5f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { value: 'S/ 50,000,000', label: 'en proyectos ejecutados' },
                { value: '150+', label: 'proyectos completados' },
                { value: '30+', label: 'profesionales en el equipo' },
                { value: '12', label: 'departamentos del Perú' },
              ].map((s) => (
                <div key={s.label} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <div className="text-[#f59e0b] text-3xl font-extrabold">{s.value}</div>
                  <div className="mt-2 text-white/80 font-semibold">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="nosotros" className="bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
            <div className="max-w-3xl">
              <p className="text-blue-950/70 font-semibold uppercase tracking-wide text-sm">Por qué elegirnos</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-blue-950">Criterio técnico, procesos claros y resultados</h2>
              <p className="mt-3 text-gray-600">Integramos experiencia y tecnología para ejecutar con calidad desde el inicio.</p>
            </div>

            <div className="mt-10 grid md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Experiencia comprobada',
                  desc: 'Más de 10 años ejecutando proyectos en el Perú, con enfoque en cumplimiento y calidad.',
                },
                {
                  title: 'Tecnología moderna',
                  desc: 'Levantamientos, planos y coordinación técnica con herramientas para reducir errores.',
                },
                {
                  title: 'Compromiso con la calidad',
                  desc: 'Supervisión y control para garantizar que tu obra cumpla con los estándares esperados.',
                },
              ].map((x) => (
                <div key={x.title} className="bg-white rounded-2xl border border-gray-200 p-7 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-2xl bg-[#f59e0b]/15 border border-[#f59e0b]/25 text-[#f59e0b] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-extrabold text-blue-950">{x.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{x.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="proyectos" className="bg-[#1e3a5f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
            <SectionHeader
              eyebrow="Proyectos destacados"
              title="Resultados que respaldan nuestra trayectoria"
              subtitle="Una selección de proyectos donde combinamos planificación técnica y ejecución confiable."
            />

            <div className="mt-10 grid md:grid-cols-3 gap-6">
              {[
                {
                  nombre: 'Edificio Residencial Los Olivos - Lima',
                  tipo: 'Construcción de viviendas y edificios',
                  estado: 'En ejecución',
                  grad: 'from-[#f59e0b]/25 to-white/0',
                },
                {
                  nombre: 'Habilitación Urbana Santa Rosa - Junín',
                  tipo: 'Habilitación urbana',
                  estado: 'Completado',
                  grad: 'from-blue-300/25 to-white/0',
                },
                {
                  nombre: 'Levantamiento Topográfico Valle Verde - Huancayo',
                  tipo: 'Topografía y levantamiento',
                  estado: 'Completado',
                  grad: 'from-[#93c5fd]/25 to-white/0',
                },
              ].map((p) => (
                <div
                  key={p.nombre}
                  className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`h-44 bg-gradient-to-br ${p.grad} flex items-center justify-center`}>
                    <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 text-[#f59e0b] flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 20V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                        <path d="M8 20v-6h8v6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                        <path d="M8 9h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-sm text-white/70 font-semibold">{p.tipo}</p>
                    <h3 className="mt-2 text-lg font-extrabold text-white leading-snug">{p.nombre}</h3>
                    <div className="mt-4 flex items-center justify-between">
                      <span
                        className={`text-xs font-extrabold rounded-full px-3 py-1 border ${
                          p.estado === 'Completado'
                            ? 'bg-emerald-400/15 border-emerald-300/20 text-emerald-200'
                            : 'bg-[#f59e0b]/15 border-[#f59e0b]/30 text-[#f59e0b]'
                        }`}
                      >
                        {p.estado}
                      </span>
                      <a
                        href="#contacto"
                        className="text-xs font-bold text-[#f59e0b] hover:text-[#f59e0b]/80 transition"
                      >
                        Consultar →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
            <div className="max-w-3xl">
              <p className="text-blue-950/70 font-semibold uppercase tracking-wide text-sm">Testimonios</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-blue-950">Confianza y satisfacción en cada proyecto</h2>
              <p className="mt-3 text-gray-600">Comentarios ficticios de clientes peruanos sobre el servicio de LOZCAM.</p>
            </div>

            <div className="mt-10 grid md:grid-cols-3 gap-6">
              {[
                {
                  nombre: 'María Fernanda R.',
                  cargo: 'Gerente de Proyectos',
                  comentario:
                    'LOZCAM nos acompañó con alta coordinación y transparencia. El resultado final superó nuestras expectativas y el cronograma se respetó.',
                },
                {
                  nombre: 'Carlos Pacheco',
                  cargo: 'Propietario',
                  comentario:
                    'Desde la topografía hasta las instalaciones, todo fue preciso y con excelente comunicación. Se nota el trabajo profesional.',
                },
                {
                  nombre: 'Andrea Salazar',
                  cargo: 'Desarrollo Inmobiliario',
                  comentario:
                    'La supervisión fue clave. Nos entregaron documentación ordenada y un acabado de calidad. Definitivamente volveríamos a contratar.',
                },
              ].map((t) => (
                <div key={t.nombre} className="bg-white rounded-2xl border border-gray-200 p-7 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-950/5 border border-blue-950/10 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#1e3a5f]" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="1.8" />
                        <path d="M20 21a8 8 0 0 0-16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-extrabold text-blue-950">{t.nombre}</p>
                      <p className="text-xs text-gray-500">{t.cargo}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-600 leading-relaxed">{t.comentario}</p>
                  <div className="mt-5 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-[#f59e0b]">
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z" />
                        </svg>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-4">
                <p className="text-blue-950/70 font-semibold uppercase tracking-wide text-sm">Ubicación</p>
                <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-blue-950">Encuéntranos</h2>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-gray-200 p-5 bg-[#f8fafc]">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Dirección</p>
                    <p className="mt-2 text-sm font-bold text-blue-950 leading-relaxed">
                      Av. Los Ingenieros 245, <br /> San Isidro, Lima, Perú
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Teléfono</p>
                    <p className="mt-2 text-sm font-bold text-blue-950">+51 999 888 777</p>
                  </div>
                  <div className="rounded-2xl border border-gray-200 p-5 bg-[#f8fafc]">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</p>
                    <p className="mt-2 text-sm font-bold text-blue-950">contacto@grupolozcam.pe</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-sm">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.2!2d-77.0366!3d-12.0974!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDA1JzUwLjkiUyA3N8KwMDInMTEuOCJX!5e0!3m2!1ses!2spe!4v1"
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Mapa de ubicación"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contacto" className="bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5">
                <p className="text-blue-950/70 font-semibold uppercase tracking-wide text-sm">Contacto</p>
                <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-blue-950">Envíanos tu consulta</h2>
                <p className="mt-3 text-gray-600">Completa el formulario y nos comunicaremos contigo para cotizar tu proyecto.</p>

                <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-extrabold text-blue-950">Respuesta rápida</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Horario de atención: Lunes a Viernes. <br />
                    (Formulario demo; no envía datos reales.)
                  </p>

                  <div className="mt-5 grid sm:grid-cols-2 gap-4">
                    {[{ k: 'Email', v: 'contacto@grupolozcam.pe' }, { k: 'Teléfono', v: '+51 999 888 777' }].map((i) => (
                      <div key={i.k}>
                        <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">{i.k}</p>
                        <p className="text-sm font-bold text-blue-950 mt-1">{i.v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <FormContacto />
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-[#0f2440]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
            <div className="grid md:grid-cols-12 gap-8">
              <div className="md:col-span-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 text-white flex items-center justify-center">
                    <BuildingIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-white font-extrabold text-lg">GRUPO LOZCAM</p>
                    <p className="text-white/70 text-xs -mt-0.5">S.A.C</p>
                  </div>
                </div>
                <p className="mt-4 text-white/70 text-sm leading-relaxed">
                  Constructora peruana enfocada en excelencia, precisión y calidad en cada etapa del proyecto.
                </p>
                <p className="mt-5 text-xs text-white/60">© 2025 GRUPO LOZCAM S.A.C</p>
              </div>

              <div className="md:col-span-8">
                <div className="grid sm:grid-cols-3 gap-6">
                  <div>
                    <p className="text-white font-extrabold text-sm">Links rápidos</p>
                    <ul className="mt-3 space-y-2">
                      {[
                        { label: 'Inicio', href: '#inicio' },
                        { label: 'Servicios', href: '#servicios' },
                        { label: 'Proyectos', href: '#proyectos' },
                        { label: 'Nosotros', href: '#nosotros' },
                        { label: 'Contacto', href: '#contacto' },
                      ].map((l) => (
                        <li key={l.href}>
                          <a href={l.href} className="text-white/70 hover:text-white transition-colors text-sm">
                            {l.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-white font-extrabold text-sm">Servicios</p>
                    <ul className="mt-3 space-y-2">
                      {[
                        'Construcción',
                        'Topografía',
                        'Arquitectura',
                        'Instalaciones',
                        'Supervisión',
                        'Habilitación urbana',
                      ].map((s) => (
                        <li key={s}>
                          <a href="#servicios" className="text-white/70 hover:text-white transition-colors text-sm">
                            {s}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-white font-extrabold text-sm">Contacto</p>
                    <div className="mt-3 space-y-2 text-sm">
                      <p className="text-white/70">+51 999 888 777</p>
                      <p className="text-white/70">contacto@grupolozcam.pe</p>
                      <p className="text-white/70">San Isidro, Lima</p>
                    </div>

                    <div className="mt-5 flex items-center gap-3">
                      {[{ label: 'Facebook', href: '#' }, { label: 'Instagram', href: '#' }, { label: 'LinkedIn', href: '#' }].map((r) => (
                        <a
                          key={r.label}
                          href={r.href}
                          aria-label={r.label}
                          className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 text-white flex items-center justify-center hover:bg-white/15 transition"
                        >
                          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            />
                            <path
                              d="M8.5 12h7"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

