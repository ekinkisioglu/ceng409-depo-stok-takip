"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/client";

export default function UrunEklePage() {
  const router = useRouter();
  const [hata, setHata] = useState<string | null>(null);
  const [basari, setBasari] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHata(null);
    setBasari(null);
    setYukleniyor(true);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const kod = String(form.get("kod") ?? "").trim();
    const { error } = await supabase.rpc("ekle_urun", {
      p_code: kod,
      p_name: String(form.get("ad") ?? "").trim(),
      p_unit: String(form.get("birim") ?? ""),
      p_critical_level: Number(form.get("kritik_seviye") ?? 0),
    });

    setYukleniyor(false);

    if (error) {
      setHata(error.message);
      return;
    }

    setBasari(`Ürün eklendi: ${kod}`);
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <AppShell title="Ürün Ekle" backHref="/yonetim">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Ürün kodu
          <input
            type="text"
            name="kod"
            placeholder="P-1004"
            required
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Ürün adı
          <input
            type="text"
            name="ad"
            required
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Ölçü birimi
          <select
            name="birim"
            required
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="adet">Adet</option>
            <option value="koli">Koli</option>
            <option value="kg">Kg</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Kritik stok seviyesi
          <input
            type="number"
            name="kritik_seviye"
            min={0}
            step="any"
            defaultValue={0}
            required
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        {hata ? <p className="text-sm text-red-600">{hata}</p> : null}
        {basari ? <p className="text-sm text-green-600">✅ {basari}</p> : null}

        <button
          type="submit"
          disabled={yukleniyor}
          className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {yukleniyor ? "Kaydediliyor..." : "Ürünü Kaydet"}
        </button>
      </form>
    </AppShell>
  );
}
