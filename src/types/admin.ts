export interface RepositoryMutationResult {
  success: boolean;
  message: string;
  mode: "supabase" | "mock";
}
