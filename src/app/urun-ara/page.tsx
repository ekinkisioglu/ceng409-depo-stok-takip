import { AppShell } from "@/components/app-shell";

export default function UrunAraPage() {
  return (
    <AppShell title="Ürün Ara" backHref="/ana-sayfa">
      <input
        type="search"
        placeholder="Kod veya ad ara..."
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />

      <p className="text-sm text-zinc-400">
        Ürün listesi henüz veritabanına bağlı değil (iskelet aşaması —
        geliştirme sırası adım 2: Veri).
      </p>
    </AppShell>
  );
}
