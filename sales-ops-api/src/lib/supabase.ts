// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabasePublic = createClient(
  'https://eitjcykqheiytqzhewrt.supabase.co',
  'sb_publishable_6yZGNx259QP6T4O68XUwpA_3_hlnyjI'
);

export const supabaseAdmin = createClient(
  'https://eitjcykqheiytqzhewrt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpdGpjeWtxaGVpeXRxemhld3J0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDM4ODc5NywiZXhwIjoyMDg1OTY0Nzk3fQ.fLxjgAytlzTgJB2m1kztUGkACRKwZqVZ4doL-xPmwKM' // HARDCODEADA PARA TEST
);