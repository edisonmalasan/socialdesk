import { cookies } from 'next/headers';

/**
 * Extracts and decodes the user ID from the 'auth-token' JWT cookie.
 * Does not verify the signature since the frontend only uses this for temporary
 * API route routing until routes are moved to the backend.
 * 
 * @returns user ID string or null if not authenticated
 */
export async function getUserIdFromToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) return null;

  try {
    // JWT format: header.payload.signature
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;
    
    // Decode base64url
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    return payload.id || null;
  } catch (error) {
    console.error('Failed to decode JWT payload:', error);
    return null;
  }
}
