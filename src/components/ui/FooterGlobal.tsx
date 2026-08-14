import Link from 'next/link';

export default function FooterGlobal() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-congreso-ink text-congreso-smoke">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.6fr_1fr_1fr] lg:px-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-congreso-gold">
            ELIGE 2026
          </p>
          <h2 className="mt-3 max-w-md text-2xl font-black leading-tight text-white">
            1er Congreso Internacional en Gestion Empresarial
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">
            Instituto Tecnologico Superior de Zongolica. Encuentro academico
            para impulsar liderazgo, emprendimiento e innovacion empresarial.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-congreso-gold">
            Informacion
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-white/75">
            <li>
              <Link href="/terminos" className="transition-colors hover:text-congreso-gold">
                Terminos y condiciones
              </Link>
            </li>
            <li>
              <Link href="/privacidad" className="transition-colors hover:text-congreso-gold">
                Aviso de privacidad
              </Link>
            </li>
            <li>
              <Link href="/faqs" className="transition-colors hover:text-congreso-gold">
                Preguntas frecuentes
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-congreso-gold">
            Contacto
          </h3>
          <div className="mt-4 space-y-3 text-sm leading-6 text-white/75">
            <p>Campus Zongolica, Veracruz</p>
            <p>Teatro Metropolitano de Orizaba</p>
            <a
              href="mailto:soporte@congresoige.com"
              className="inline-block font-semibold text-congreso-gold transition-colors hover:text-white"
            >
              soporte@congresoige.com
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Congreso IGE. Todos los derechos reservados.</p>
          <p>Instituto Tecnologico Superior de Zongolica</p>
        </div>
      </div>
    </footer>
  );
}
