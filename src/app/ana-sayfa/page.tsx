import Link from "next/link";
import { AppShell } from "@/components/app-shell";

const islemler = [
  { href: "/urun-ara", label: "Ürün Ara" },
  { href: "/stok-giris", label: "Stok Girişi" },
  { href: "/stok-cikis", label: "Stok Çıkışı" },
  { href: "/transfer", label: "Transfer" },
  { href: "/sayim", label: "Sayım" },
  { href: "/gecmis", label: "Stok Sorgula / Geçmiş" },
];

export default function AnaSayfaPage() {
  return (
    <AppShell title="Ana Ekran">
      <p className="text-sm text-zinc-500">
        Merhaba — rol: <span className="font-medium">Depo Personeli</span>
      </p>

      <nav className="flex flex-col gap-2">
        {islemler.map((islem) => (
          <Link
            key={islem.href}
            href={islem.href}
            className="rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900"
          >
            {islem.label}
          </Link>
        ))}
        <Link
          href="/yonetim"
          className="rounded-md border border-dashed border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-500"
        >
          Yönetim Paneli (Depo Sorumlusu)
        </Link>
      </nav>
    </AppShell>
  );
}
