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

type Props = {
  urunKoduBaslangic?: string;
  urunler: { code: string; name: string }[];
  depolar: { code: string; name: string }[];
  konumlar: Konum[];
};

export function StokCikisFormu({
  urunKoduBaslangic = "",
  urunler,
  depolar,
  konumlar,
}: Props) {
  const bosForm: FormAlanlari = {
    urun_kodu: urunKoduBaslangic,
    depo_kodu: "",
    raf_kodu: "",
    miktar: "",
    not: "",
  };

  const [form, setForm] = useState<FormAlanlari>(bosForm);
  const [onayEkraninda, setOnayEkraninda] = useState(false);
  const [idemKey, setIdemKey] = useState<string>(() => crypto.randomUUID());
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

  function handleDevamEt(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHata(null);
    setBasari(null);
    setOnayEkraninda(true);
  }

  async function handleOnayla() {
    setYukleniyor(true);
    const supabase = createClient();

    // Aynı istek yanlışlıkla iki kez gönderilirse (S3 senaryosu) sunucu
    // aynı idempotency anahtarıyla ikinci bir hareket oluşturmaz.
    const { data, error } = await supabase.rpc("kayit_stok_hareketi", {
      p_product_code: form.urun_kodu.trim(),
      p_movement_type: "CIKIS",
      p_quantity: Number(form.miktar),
      p_warehouse_code: form.depo_kodu.trim(),
      p_location_code: form.raf_kodu.trim(),
      p_note: form.not || null,
      p_idempotency_key: idemKey,
    });

    setYukleniyor(false);

    if (error) {
      // "Yetersiz stok: mevcut X, girilen Y" mesajı veritabanı fonksiyonundan
      // doğrudan gelir (S2 senaryosu).
      setHata(error.message);
      setOnayEkraninda(false);
      return;
    }

    setBasari(`Stok çıkışı kaydedildi. Yeni miktar: ${data}`);
    setForm(bosForm);
    setOnayEkraninda(false);
    setIdemKey(crypto.randomUUID());
  }

  function handleVazgec() {
    setOnayEkraninda(false);
  }

  return !onayEkraninda ? (
    <form onSubmit={handleDevamEt} className="flex flex-col gap-3">
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
          value={form.depo_kodu}
          onChange={(v) => alanDegisti("depo_kodu", v)}
          secenekler={depoSecenekleri}
          placeholder="DEPO-A"
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Kaynak raf kodu
        <ComboBox
          value={form.raf_kodu}
          onChange={(v) => alanDegisti("raf_kodu", v)}
          secenekler={rafSecenekleri}
          placeholder="RAF-3"
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
        className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
      >
        Devam Et
      </button>
    </form>
  ) : (
    <div className="flex flex-col gap-3">
      <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="font-semibold">Lütfen kontrol edin:</p>
        <p className="mt-1">
          <b>{form.urun_kodu}</b> ürününden{" "}
          <b>
            {form.depo_kodu}/{form.raf_kodu}
          </b>{" "}
          konumundan <b>{form.miktar}</b> birim çıkış yapılacak.
        </p>
        <p className="mt-1 text-xs text-amber-700">
          Ürün kodu ve depo/raf kodu doğru mu? Yanlışsa &quot;Vazgeç&quot;e
          basıp düzeltin (S6 senaryosu).
        </p>
      </div>

      {hata ? <p className="text-sm text-red-600">{hata}</p> : null}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleVazgec}
          disabled={yukleniyor}
          className="flex-1 rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 disabled:opacity-50"
        >
          Vazgeç
        </button>
        <button
          type="button"
          onClick={handleOnayla}
          disabled={yukleniyor}
          className="flex-1 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {yukleniyor ? "Kaydediliyor..." : "Onayla"}
        </button>
      </div>
    </div>
  );
}
