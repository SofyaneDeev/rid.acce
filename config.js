/* =========================================================
   RID ACCE — Supabase connection
   Fill these two values from the shop's Supabase project:
   Dashboard → Project Settings → API (or "Data API").
   - supabaseUrl:     "Project URL", e.g. https://abcd1234.supabase.co
   - supabaseAnonKey: the "anon" / "public" key
   The anon key is designed to be public: security comes from the
   rules in supabase/schema.sql. NEVER put the "service_role" key here.

   While these are empty, the shop shows products-seed.js and the
   admin page shows the setup instructions.
   ========================================================= */
window.AURELE_CONFIG = {
  // Project "rid.acce" (organization red.ax)
  supabaseUrl: "https://afdgokyvhijffygvjqem.supabase.co",
  // WhatsApp number for the "Order on WhatsApp" button, international format without + or spaces
  // e.g. "212612345678". Leave empty to hide the button.
  whatsappNumber: "",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmZGdva3l2aGlqZmZ5Z3ZqcWVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwNTE2MzMsImV4cCI6MjEwOTYyNzYzM30.i2aOJw89UFAiFRvSOBNCY6C0Pi2VJBArvCVV5rrC6pA",
};
