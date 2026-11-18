import { AppShell } from "@/components/app-shell";

export default function SayimPage() {
  return (
    <AppShell title="Sayım" backHref="/ana-sayfa">
      <form className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Ürün kodu/adı
          <input
            type="text"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Depo/raf
          <input
            type="text"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Fiziksel sayım miktarı
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
          Sayımı Kaydet
        </button>
      </form>
      <p className="text-sm text-zinc-400">
        Fark tespit edilirse (S7 senaryosu) sistem miktarını değiştirmez;
        Depo Sorumlusu onayına giden bir düzeltme talebi oluşturur.
      </p>
    </AppShell>
  );
}
