import { auth } from "@/proto/auth";
import { getService } from "@/lib/grpc/client";
import { ServiceError } from "@grpc/grpc-js";

export async function getRole(email: string): Promise<string> {
  const client = await getService<auth.authClient>("auth.auth");
  const request = new auth.RoleRequest({ email });

  return new Promise((resolve, reject) => {
    client.role(request, (err: ServiceError | null, response?: auth.RoleResponse) => {
      if (err || !response) {
        return reject(new Error(err?.message || "Failed to get role"));
      }
      return resolve(response.role);
    });
  });
}

export async function createRole(email: string, role: auth.Roles): Promise<auth.Status> {
  const client = await getService<auth.authClient>("auth.auth");
  const request = new auth.CreateRoleRequest({ email, role });

  return new Promise((resolve, reject) => {
    client.createRole(request, (err: ServiceError | null, response?: auth.CreateRoleResponse) => {
      if (err || !response) {
        return reject(new Error(err?.message || "Failed to create role"));
      }
      return resolve(response.status);
    });
  });
} 