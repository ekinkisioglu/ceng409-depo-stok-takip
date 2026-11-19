"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function CikisButonu() {
  const router = useRouter();
  const [cikisYapiliyor, setCikisYapiliyor] = useState(false);

  async function handleCikis() {
    setCikisYapiliyor(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleCikis}
      disabled={cikisYapiliyor}
      className="text-sm text-zinc-500 underline disabled:opacity-50"
    >
      {cikisYapiliyor ? "Çıkış yapılıyor..." : "Çıkış"}
    </button>
  );
}
