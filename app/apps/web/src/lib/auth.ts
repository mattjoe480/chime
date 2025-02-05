export async function checkUserRole(email: string): Promise<string> {
  const response = await fetch(`/api/role?email=${encodeURIComponent(email)}`);
  const data = await response.json();
  return data.role;
} 