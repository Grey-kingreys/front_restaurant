// src/lib/api/roles.ts
import { apiRequest } from "./client";
import type { ApiResponse, Permission, RoleConfig, RoleConfigDetail, RoleCreatePayload, RoleUpdatePayload } from "@/types";

const BASE = "/accounts";

export async function listPermissions(): Promise<ApiResponse<Permission[]>> {
    return apiRequest<ApiResponse<Permission[]>>(`${BASE}/permissions/`);
}

export async function listRoles(): Promise<ApiResponse<{ count: number; roles: RoleConfig[] }>> {
    return apiRequest<ApiResponse<{ count: number; roles: RoleConfig[] }>>(`${BASE}/roles/`);
}

export async function getRole(id: number): Promise<ApiResponse<RoleConfigDetail>> {
    return apiRequest<ApiResponse<RoleConfigDetail>>(`${BASE}/roles/${id}/`);
}

export async function createRole(payload: RoleCreatePayload): Promise<ApiResponse<RoleConfigDetail>> {
    return apiRequest<ApiResponse<RoleConfigDetail>>(`${BASE}/roles/`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateRole(id: number, payload: RoleUpdatePayload): Promise<ApiResponse<RoleConfigDetail>> {
    return apiRequest<ApiResponse<RoleConfigDetail>>(`${BASE}/roles/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

export async function deleteRole(id: number): Promise<ApiResponse<null>> {
    return apiRequest<ApiResponse<null>>(`${BASE}/roles/${id}/`, { method: "DELETE" });
}
