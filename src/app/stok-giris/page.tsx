import { AppShell } from "@/components/app-shell";

export default function StokGirisPage() {
  return (
    <AppShell title="Stok Girişi" backHref="/ana-sayfa">
      <form className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Ürün kodu/adı
          <input
            type="text"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Hedef depo/raf
          <input
            type="text"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Miktar
          <input
            type="number"
            min={0}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled
          className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          Onayla
        </button>
      </form>
      <p className="text-sm text-zinc-400">
        Bu işlem henüz kalıcı veritabanına yazmıyor (iskelet aşaması —
        geliştirme sırası adım 3: İşlem).
      </p>
    </AppShell>
  );
}
