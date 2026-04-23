import { isSupabaseConfigured } from "@/lib/supabase/server";
import { MockRepository } from "./mock-repository";
import { SiteRepository } from "./repository";
import { SupabaseRepository } from "./supabase-repository";

const mockRepository = new MockRepository();
const supabaseRepository = new SupabaseRepository();

export function getRepository(): SiteRepository {
  return isSupabaseConfigured() ? supabaseRepository : mockRepository;
}
