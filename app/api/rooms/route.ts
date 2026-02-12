import { NextRequest, NextResponse } from "next/server";
import { RoomService } from "@/lib/services/room";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolId = searchParams.get("schoolId");
    const includeUnavailable =
      searchParams.get("includeUnavailable") === "true";

    if (!schoolId) {
      return NextResponse.json(
        { error: "schoolId is required" },
        { status: 400 },
      );
    }

    const rooms = await RoomService.getRooms(schoolId, includeUnavailable);
    return NextResponse.json(rooms);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const room = await RoomService.createRoom(body);
    return NextResponse.json(room);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 },
    );
  }
}
