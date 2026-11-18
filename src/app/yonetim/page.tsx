import { AppShell } from "@/components/app-shell";

export default function YonetimPage() {
  return (
    <AppShell title="Yönetim Paneli" backHref="/ana-sayfa">
      <div className="flex flex-col gap-2">
        <div className="rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm">
          ⚠ Kritik Stok Uyarıları — 0
        </div>
        <div className="rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm">
          ⏳ Bekleyen Düzeltme Talepleri — 0
        </div>
        <div className="rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm">
          ⏳ Bekleyen Transferler — 0
        </div>
      </div>
      <p className="text-sm text-zinc-400">
        Bu panel yalnızca Depo Sorumlusu rolüne açık olacaktır (yetkilendirme
        geliştirme sırası adım 4&apos;te eklenecektir).
      </p>
    </AppShell>
  );
}
