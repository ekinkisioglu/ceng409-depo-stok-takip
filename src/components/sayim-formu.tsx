"use client";

import { useMemo, useState } from "react";
import { ComboBox } from "@/components/combo-box";
import { createClient } from "@/lib/supabase/client";
import type { Konum } from "@/lib/referans-veri";

type FormAlanlari = {
  urun_kodu: string;
  depo_kodu: string;
  raf_kodu: string;
  miktar: string;
  not: string;
};

const BOS_FORM: FormAlanlari = {
  urun_kodu: "",
  depo_kodu: "",
  raf_kodu: "",
  miktar: "",
  not: "",
};

type Props = {
  urunler: { code: string; name: string }[];
  depolar: { code: string; name: string }[];
  konumlar: Konum[];
};

export function SayimFormu({ urunler, depolar, konumlar }: Props) {
  const [form, setForm] = useState<FormAlanlari>(BOS_FORM);
  const [hata, setHata] = useState<string | null>(null);
  const [sonuc, setSonuc] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  const urunSecenekleri = useMemo(
    () => urunler.map((u) => ({ value: u.code, label: `${u.code} — ${u.name}` })),
    [urunler],
  );
  const depoSecenekleri = useMemo(
    () => depolar.map((d) => ({ value: d.code, label: `${d.code} — ${d.name}` })),
    [depolar],
  );
  const rafSecenekleri = useMemo(() => {
    const kaynak = form.depo_kodu
      ? konumlar.filter((k) => k.depo_kodu === form.depo_kodu)
      : konumlar;
    return kaynak.map((k) => ({
      value: k.code,
      label: form.depo_kodu ? `${k.code} — ${k.name}` : `${k.depo_kodu}/${k.code} — ${k.name}`,
    }));
  }, [konumlar, form.depo_kodu]);

  function alanDegisti(alan: keyof FormAlanlari, deger: string) {
    setForm((f) => ({ ...f, [alan]: deger }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHata(null);
    setSonuc(null);
    setYukleniyor(true);

    const supabase = createClient();

    const { data, error } = await supabase.rpc("kayit_sayim", {
      p_product_code: form.urun_kodu.trim(),
      p_warehouse_code: form.depo_kodu.trim(),
      p_location_code: form.raf_kodu.trim(),
      p_counted_quantity: Number(form.miktar),
      p_note: form.not || null,
    });

    setYukleniyor(false);

    if (error) {
      setHata(error.message);
      return;
    }

    if (Number(data) === 0) {
      setSonuc("Fark yok — sistemdeki stok fiziksel sayımla uyumlu.");
    } else {
      setSonuc(
        `Fark tespit edildi (${data}). Düzeltme talebi Depo Sorumlusu onayına gönderildi; stok miktarı onaylanana kadar değişmeyecek.`,
      );
    }
    setForm(BOS_FORM);
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
        Depo kodu
        <ComboBox
          value={form.depo_kodu}
          onChange={(v) => alanDegisti("depo_kodu", v)}
          secenekler={depoSecenekleri}
          placeholder="DEPO-A"
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Raf kodu
        <ComboBox
          value={form.raf_kodu}
          onChange={(v) => alanDegisti("raf_kodu", v)}
          secenekler={rafSecenekleri}
          placeholder="RAF-3"
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Fiziksel sayım miktarı
        <input
          type="number"
          min={0}
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
      {sonuc ? <p className="text-sm text-green-600">✅ {sonuc}</p> : null}

      <button
        type="submit"
        disabled={yukleniyor}
        className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {yukleniyor ? "Kaydediliyor..." : "Sayımı Kaydet"}
      </button>
    </form>
  );
}
