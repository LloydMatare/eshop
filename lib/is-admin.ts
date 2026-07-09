export function isAdminUser(metadata: Record<string, unknown> | null | undefined): boolean {
  if (!metadata) return false
  return metadata?.isAdmin === true || metadata?.role === "admin"
}
