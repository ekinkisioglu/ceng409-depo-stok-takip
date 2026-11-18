import { AppShell } from "@/components/app-shell";

export default function GecmisPage() {
  return (
    <AppShell title="Stok Sorgula / Geçmiş" backHref="/ana-sayfa">
      <div className="flex gap-2 text-sm text-zinc-500">
        <span className="rounded-full border border-zinc-300 px-3 py-1">
          Ürün
        </span>
        <span className="rounded-full border border-zinc-300 px-3 py-1">
          Depo
        </span>
        <span className="rounded-full border border-zinc-300 px-3 py-1">
          Kullanıcı
        </span>
      </div>

      <p className="text-sm text-zinc-400">
        Hareket geçmişi henüz veritabanına bağlı değil (iskelet aşaması —
        geliştirme sırası adım 2: Veri).
      </p>
    </AppShell>
  );
}
