import { auth } from "@/proto/auth";
import { getService } from "@/lib/grpc/client";
import { ServiceError } from "@grpc/grpc-js";
import AuthToken = auth.AuthToken;

export async function refreshAccessToken(refreshToken: string): Promise<AuthToken> {
  const client = await getService<auth.authClient>("auth.auth");
  const request = new auth.RefreshToken({ token: refreshToken });

  return new Promise((resolve, reject) => {
    client.token(request, (err: ServiceError | null, response?: AuthToken) => {
      if (err || !response) {
        return reject(new Error(err?.message || "Failed to refresh token"));
      }
      return resolve(response);
    });
  });
} 