import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/server";

const islemler = [
  { href: "/urun-ara", label: "Ürün Ara" },
  { href: "/stok-giris", label: "Stok Girişi" },
  { href: "/stok-cikis", label: "Stok Çıkışı" },
  { href: "/transfer", label: "Transfer" },
  { href: "/sayim", label: "Sayım" },
  { href: "/gecmis", label: "Stok Sorgula / Geçmiş" },
];

const ROL_ETIKETI: Record<string, string> = {
  depo_personeli: "Depo Personeli",
  depo_sorumlusu: "Depo Sorumlusu",
};

export default async function AnaSayfaPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  let adSoyad = auth.user?.email ?? "";
  let rol = "";

  if (auth.user) {
    const { data: profil } = await supabase
      .from("users")
      .select("full_name, role")
      .eq("id", auth.user.id)
      .maybeSingle();

    if (profil) {
      adSoyad = profil.full_name;
      rol = profil.role;
    }
  }

  return (
    <AppShell title="Ana Ekran">
      <p className="text-sm text-zinc-500">
        Merhaba, {adSoyad} — rol:{" "}
        <span className="font-medium">
          {ROL_ETIKETI[rol] ?? "bilinmiyor"}
        </span>
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
        {rol === "depo_sorumlusu" ? (
          <Link
            href="/yonetim"
            className="rounded-md border border-zinc-300 bg-zinc-100 px-4 py-3 text-sm font-medium text-zinc-900"
          >
            Yönetim Paneli
          </Link>
        ) : null}
      </nav>
    </AppShell>
  );
}
