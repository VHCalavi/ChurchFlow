import { NextResponse } from "next/server";
import { prisma } from "@churchflow/database";

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { name: "asc" }
    });

    const permissions = await prisma.permission.findMany({
      orderBy: { resource: "asc" }
    });

    const rolePermissions = await prisma.rolePermission.findMany();

    return NextResponse.json({
      success: true,
      data: {
        roles,
        permissions,
        rolePermissions: rolePermissions.map(rp => ({
          roleId: rp.roleId,
          permissionId: rp.permissionId
        }))
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: "Erreur lors du chargement des permissions: " + message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rolePermissions } = body;

    if (!Array.isArray(rolePermissions)) {
      return NextResponse.json(
        { success: false, error: "Payload invalide, rolePermissions doit être un tableau" },
        { status: 400 }
      );
    }

    // Update mappings inside a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Delete all current role-permission mappings
      await tx.rolePermission.deleteMany({});

      // 2. Insert new mappings
      if (rolePermissions.length > 0) {
        await tx.rolePermission.createMany({
          data: rolePermissions.map((rp: { roleId: string; permissionId: string }) => ({
            roleId: rp.roleId,
            permissionId: rp.permissionId
          }))
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Matrice de permissions mise à jour avec succès"
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: "Erreur lors de la mise à jour des permissions: " + message },
      { status: 500 }
    );
  }
}
