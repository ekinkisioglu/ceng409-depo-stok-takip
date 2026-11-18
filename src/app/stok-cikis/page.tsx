import { AppShell } from "@/components/app-shell";

export default function StokCikisPage() {
  return (
    <AppShell title="Stok Çıkışı" backHref="/ana-sayfa">
      <form className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Ürün kodu/adı
          <input
            type="text"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Kaynak depo/raf
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
        Yetersiz stok kontrolü (S2 senaryosu) ve kalıcı kayıt, geliştirme
        sırası adım 3&apos;te (İşlem) eklenecektir.
      </p>
    </AppShell>
  );
}
