import { createSupabaseAdmin } from "@/lib/supabase";

const TOTP_ENROLLED_KEY = "totp_enrolled";

export async function isTotpEnrolled(): Promise<boolean> {
  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", TOTP_ENROLLED_KEY)
      .maybeSingle();

    if (error) return false;
    return data?.value === "true";
  } catch {
    return false;
  }
}

export async function setTotpEnrolled(enrolled: boolean): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("admin_settings").upsert(
    {
      key: TOTP_ENROLLED_KEY,
      value: enrolled ? "true" : "false",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

  if (error) {
    throw new Error(error.message);
  }
}
