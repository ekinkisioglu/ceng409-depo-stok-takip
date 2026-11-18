import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server Components için Supabase istemcisi. Sadece public/anon key
// kullanılır — service role key hiçbir zaman burada veya başka bir yerde
// istemci koduna konulmayacak (bkz. docs/00-kritik-kurallar-checklist.md - E).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component içinden çağrılırsa cookie set edilemez;
            // oturum yenileme middleware'de yapılacağı için güvenle yut.
          }
        },
      },
    },
  );
}
