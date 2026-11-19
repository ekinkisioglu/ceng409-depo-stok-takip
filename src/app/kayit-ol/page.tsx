"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/client";

export default function KayitOlPage() {
  const router = useRouter();
  const [hata, setHata] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHata(null);
    setYukleniyor(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const adSoyad = String(form.get("ad_soyad") ?? "");

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error || !data.user) {
      setYukleniyor(false);
      setHata(error?.message ?? "Kayıt başarısız oldu");
      return;
    }

    // Varsayılan rol: depo_personeli. Rol yönetimi Adım 4'te eklenecektir.
    const { error: profilHata } = await supabase.from("users").insert({
      id: data.user.id,
      email,
      full_name: adSoyad,
      role: "depo_personeli",
    });

    setYukleniyor(false);

    if (profilHata) {
      setHata(`Profil oluşturulamadı: ${profilHata.message}`);
      return;
    }

    router.push("/ana-sayfa");
    router.refresh();
  }

  return (
    <AppShell title="Kayıt Ol" backHref="/" cikisGoster={false}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Ad Soyad
          <input
            type="text"
            name="ad_soyad"
            required
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          E-posta
          <input
            type="email"
            name="email"
            required
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Şifre
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        {hata ? <p className="text-sm text-red-600">{hata}</p> : null}

        <button
          type="submit"
          disabled={yukleniyor}
          className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {yukleniyor ? "Kaydediliyor..." : "Kayıt Ol"}
        </button>
      </form>
    </AppShell>
  );
}
