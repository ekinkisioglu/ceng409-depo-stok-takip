import Link from "next/link";
import { CikisButonu } from "@/components/cikis-butonu";

type AppShellProps = {
  title: string;
  backHref?: string;
  cikisGoster?: boolean;
  children: React.ReactNode;
};

export function AppShell({
  title,
  backHref,
  cikisGoster = true,
  children,
}: AppShellProps) {
  return (
    <div className="flex flex-1 justify-center">
      <div className="flex w-full max-w-sm flex-col">
        <header className="flex items-center gap-2 border-b border-zinc-200 bg-white px-4 py-3">
          {backHref ? (
            <Link
              href={backHref}
              className="text-lg text-zinc-500"
              aria-label="Geri"
            >
              ←
            </Link>
          ) : null}
          <h1 className="flex-1 text-base font-semibold text-zinc-900">
            {title}
          </h1>
          {cikisGoster ? <CikisButonu /> : null}
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4">{children}</main>
      </div>
    </div>
  );
}
