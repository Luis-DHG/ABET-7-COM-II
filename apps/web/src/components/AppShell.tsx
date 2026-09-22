import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { ChevronDown, LogOut, Menu, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FORUM_PATH, MODULES } from "@/lib/manifest";
import { useSession } from "@/session/SessionProvider";

const CONTACT_EMAIL = "chaconvargasfabiancamilo@gmail.com";

export function AppShell() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Saltar al contenido
      </a>
      <Header />
      <OfflineBanner />
      <main id="contenido" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  const { status, user, logout } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-3 px-4 sm:px-6">
        <Link to="/planeacion" className="shrink-0 font-semibold tracking-tight" aria-label="BlogDPC ISAC, inicio">
          BlogDPC · ISAC
        </Link>

        {/* Navegación escritorio */}
        <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Principal">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                Módulos
                <ChevronDown aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              <DropdownMenuLabel>Siete módulos del proyecto</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {MODULES.map((module) => (
                <DropdownMenuItem key={module.path} asChild>
                  <Link to={module.path}>
                    <span className="text-muted-foreground tabular-nums">{module.number}.</span> {module.title}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <NavLink
            to={FORUM_PATH}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`
            }
          >
            Retroalimentación
          </NavLink>

          {user?.role === "ADMIN" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  Administración
                  <ChevronDown aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link to="/admin/comentarios">Moderar comentarios</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/usuarios">Gestionar usuarios</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            {status === "unknown" ? null : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" aria-label={`Cuenta de ${user.displayName}`}>
                    <UserRound aria-hidden />
                    <span className="max-w-32 truncate">{user.displayName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {user.displayName}
                    <span className="block text-xs font-normal text-muted-foreground">{user.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => void logout()}>
                    <LogOut aria-hidden /> Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm">
                <Link to="/login">Ingresar</Link>
              </Button>
            )}
          </div>

          {/* Menú móvil */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Abrir menú de navegación">
                <Menu aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>BlogDPC · ISAC</SheetTitle>
                <SheetDescription>Señales, radar y comunicaciones.</SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4 pb-6" aria-label="Móvil">
                <p className="px-2 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Módulos</p>
                {MODULES.map((module) => (
                  <Link
                    key={module.path}
                    to={module.path}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-2 py-2 text-sm hover:bg-secondary"
                  >
                    <span className="text-muted-foreground tabular-nums">{module.number}.</span> {module.title}
                  </Link>
                ))}
                <Separator className="my-2" />
                <Link
                  to={FORUM_PATH}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-2 py-2 text-sm font-medium hover:bg-secondary"
                >
                  Retroalimentación
                </Link>
                {user?.role === "ADMIN" ? (
                  <>
                    <Link
                      to="/admin/comentarios"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-md px-2 py-2 text-sm hover:bg-secondary"
                    >
                      Administración: comentarios
                    </Link>
                    <Link
                      to="/admin/usuarios"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-md px-2 py-2 text-sm hover:bg-secondary"
                    >
                      Administración: usuarios
                    </Link>
                  </>
                ) : null}
                <Separator className="my-2" />
                {user ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    onClick={() => {
                      setMobileOpen(false);
                      void logout();
                    }}
                  >
                    <LogOut aria-hidden /> Cerrar sesión ({user.displayName})
                  </Button>
                ) : (
                  <Button asChild size="sm" onClick={() => setMobileOpen(false)}>
                    <Link to="/login">Ingresar</Link>
                  </Button>
                )}
                <Separator className="my-2" />
                <div className="flex gap-4 px-2 text-sm">
                  <Link to="/privacidad" onClick={() => setMobileOpen(false)} className="text-muted-foreground underline underline-offset-4">
                    Privacidad
                  </Link>
                  <Link to="/terminos" onClick={() => setMobileOpen(false)} className="text-muted-foreground underline underline-offset-4">
                    Términos
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function OfflineBanner() {
  const { status, online } = useSession();
  if (online && status !== "unverifiable") return null;
  const message = !online
    ? "Sin conexión. Puedes seguir leyendo el contenido ya cargado; no es posible publicar."
    : "No se puede verificar tu sesión en este momento. La lectura sigue disponible.";
  return (
    <div role="status" className="border-b border-primary/40 bg-secondary px-4 py-2 text-center text-sm">
      {message}
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-6 text-sm text-muted-foreground sm:px-6">
        <Link to="/privacidad" className="underline underline-offset-4 hover:text-foreground">
          Privacidad
        </Link>
        <Link to="/terminos" className="underline underline-offset-4 hover:text-foreground">
          Términos
        </Link>
        <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4 hover:text-foreground">
          Contacto
        </a>
        <span className="ml-auto">BlogDPC · ISAC — señales, radar y comunicaciones</span>
      </div>
    </footer>
  );
}
