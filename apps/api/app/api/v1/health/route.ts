import { NextResponse } from "next/server";
import { prisma } from "@churchflow/database";

export async function GET() {
  try {
    // Check DB connection status (querying count of churches as health check)
    // In local dev, if database is not running, we'll catch and return a warning
    const dbCheck = await prisma.church.count().catch(() => "disconnected");
    
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: dbCheck === "disconnected" ? "disconnected" : "connected",
      message: "ChurchFlow API is running successfully."
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { status: "unhealthy", error: message },
      { status: 500 }
    );
  }
}
