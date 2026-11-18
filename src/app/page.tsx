"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/client";

export default function GirisPage() {
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

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setYukleniyor(false);

    if (error) {
      setHata("Kullanıcı adı veya şifre hatalı");
      return;
    }

    router.push("/ana-sayfa");
    router.refresh();
  }

  return (
    <AppShell title="Depo Stok Takip">
      <p className="text-sm text-zinc-500">
        CENG 409 - Mobil Depo ve Stok Takip Sistemi
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          E-posta
          <input
            type="email"
            name="email"
            required
            placeholder="ornek@depo.com"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
          Şifre
          <input
            type="password"
            name="password"
            required
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        {hata ? <p className="text-sm text-red-600">{hata}</p> : null}

        <button
          type="submit"
          disabled={yukleniyor}
          className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {yukleniyor ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500">
        Hesabın yok mu?{" "}
        <Link href="/kayit-ol" className="underline">
          Kayıt ol
        </Link>
      </p>
    </AppShell>
  );
}
