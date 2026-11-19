"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ComboBox } from "@/components/combo-box";
import { createClient } from "@/lib/supabase/client";
import type { Konum } from "@/lib/referans-veri";

type FormAlanlari = {
  urun_kodu: string;
  kaynak_depo: string;
  kaynak_raf: string;
  hedef_depo: string;
  hedef_raf: string;
  miktar: string;
  not: string;
};

type Props = {
  urunKoduBaslangic?: string;
  urunler: { code: string; name: string }[];
  depolar: { code: string; name: string }[];
  konumlar: Konum[];
};

export function TransferForm({
  urunKoduBaslangic = "",
  urunler,
  depolar,
  konumlar,
}: Props) {
  const router = useRouter();
  const bosForm: FormAlanlari = {
    urun_kodu: urunKoduBaslangic,
    kaynak_depo: "",
    kaynak_raf: "",
    hedef_depo: "",
    hedef_raf: "",
    miktar: "",
    not: "",
  };
  const [form, setForm] = useState<FormAlanlari>(bosForm);
  const [hata, setHata] = useState<string | null>(null);
  const [basari, setBasari] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  const urunSecenekleri = useMemo(
    () => urunler.map((u) => ({ value: u.code, label: `${u.code} — ${u.name}` })),
    [urunler],
  );
  const depoSecenekleri = useMemo(
    () => depolar.map((d) => ({ value: d.code, label: `${d.code} — ${d.name}` })),
    [depolar],
  );

  const kaynakRafSecenekleri = useMemo(() => {
    const kaynak = form.kaynak_depo
      ? konumlar.filter((k) => k.depo_kodu === form.kaynak_depo)
      : konumlar;
    return kaynak.map((k) => ({
      value: k.code,
      label: form.kaynak_depo
        ? `${k.code} — ${k.name}`
        : `${k.depo_kodu}/${k.code} — ${k.name}`,
    }));
  }, [konumlar, form.kaynak_depo]);
  const hedefRafSecenekleri = useMemo(() => {
    const kaynak = form.hedef_depo
      ? konumlar.filter((k) => k.depo_kodu === form.hedef_depo)
      : konumlar;
    return kaynak.map((k) => ({
      value: k.code,
      label: form.hedef_depo
        ? `${k.code} — ${k.name}`
        : `${k.depo_kodu}/${k.code} — ${k.name}`,
    }));
  }, [konumlar, form.hedef_depo]);

  function alanDegisti(alan: keyof FormAlanlari, deger: string) {
    setForm((f) => ({ ...f, [alan]: deger }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHata(null);
    setBasari(null);
    setYukleniyor(true);

    const supabase = createClient();

    const { error } = await supabase.rpc("baslat_transfer", {
      p_product_code: form.urun_kodu.trim(),
      p_quantity: Number(form.miktar),
      p_src_warehouse_code: form.kaynak_depo.trim(),
      p_src_location_code: form.kaynak_raf.trim(),
      p_dst_warehouse_code: form.hedef_depo.trim(),
      p_dst_location_code: form.hedef_raf.trim(),
      p_note: form.not || null,
    });

    setYukleniyor(false);

    if (error) {
      setHata(error.message);
      return;
    }

    setBasari("Transfer başlatıldı, hedef depo teslim almayı bekliyor.");
    setForm(bosForm);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Ürün kodu
        <ComboBox
          value={form.urun_kodu}
          onChange={(v) => alanDegisti("urun_kodu", v)}
          secenekler={urunSecenekleri}
          placeholder="P-1001"
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Kaynak depo kodu
        <ComboBox
          value={form.kaynak_depo}
          onChange={(v) => alanDegisti("kaynak_depo", v)}
          secenekler={depoSecenekleri}
          placeholder="DEPO-A"
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Kaynak raf kodu
        <ComboBox
          value={form.kaynak_raf}
          onChange={(v) => alanDegisti("kaynak_raf", v)}
          secenekler={kaynakRafSecenekleri}
          placeholder="RAF-3"
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Hedef depo kodu
        <ComboBox
          value={form.hedef_depo}
          onChange={(v) => alanDegisti("hedef_depo", v)}
          secenekler={depoSecenekleri}
          placeholder="DEPO-B"
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Hedef raf kodu
        <ComboBox
          value={form.hedef_raf}
          onChange={(v) => alanDegisti("hedef_raf", v)}
          secenekler={hedefRafSecenekleri}
          placeholder="RAF-1"
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Miktar
        <input
          type="number"
          min={0.01}
          step="any"
          required
          value={form.miktar}
          onChange={(e) => alanDegisti("miktar", e.target.value)}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Not (opsiyonel)
        <input
          type="text"
          value={form.not}
          onChange={(e) => alanDegisti("not", e.target.value)}
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
        {yukleniyor ? "Gönderiliyor..." : "Transferi Başlat"}
      </button>
    </form>
  );
}
