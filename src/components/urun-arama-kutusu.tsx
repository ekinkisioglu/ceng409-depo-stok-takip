"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Urun = { id: string; code: string; name: string; unit: string };

export function UrunAramaKutusu({ urunler }: { urunler: Urun[] }) {
  const [sorgu, setSorgu] = useState("");
  const [acik, setAcik] = useState(false);
  const kutuRef = useRef<HTMLDivElement>(null);

  const filtrelenmis = useMemo(() => {
    const s = sorgu.trim().toLowerCase();
    if (!s) return urunler;
    return urunler.filter(
      (u) => u.code.toLowerCase().includes(s) || u.name.toLowerCase().includes(s),
    );
  }, [sorgu, urunler]);

  useEffect(() => {
    function disaTikla(e: MouseEvent) {
      if (kutuRef.current && !kutuRef.current.contains(e.target as Node)) {
        setAcik(false);
      }
    }
    document.addEventListener("mousedown", disaTikla);
    return () => document.removeEventListener("mousedown", disaTikla);
  }, []);

  return (
    <div ref={kutuRef} className="relative">
      <input
        type="search"
        value={sorgu}
        onChange={(e) => {
          setSorgu(e.target.value);
          setAcik(true);
        }}
        onFocus={() => setAcik(true)}
        placeholder="Kod veya ad ara..."
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />

      {acik ? (
        <ul className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-zinc-200 bg-white shadow-lg">
          {filtrelenmis.length === 0 ? (
            <li className="px-4 py-3 text-sm text-zinc-500">
              Ürün bulunamadı. Kodu/adı kontrol edin.
            </li>
          ) : (
            filtrelenmis.map((urun) => (
              <li key={urun.id}>
                <Link
                  href={`/urun/${urun.code}`}
                  onClick={() => setAcik(false)}
                  className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5 text-sm last:border-b-0 hover:bg-zinc-50"
                >
                  <span>
                    {urun.code} — {urun.name}
                  </span>
                  <span className="text-zinc-400">{urun.unit}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
