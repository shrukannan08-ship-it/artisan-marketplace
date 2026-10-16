import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { storeId, productId, senderName, senderEmail, senderPhone, subject, message } =
      await req.json();

    if (!storeId || !senderName || !senderEmail || !subject || !message) {
      return NextResponse.json(
        { error: "Name, email, subject, and message are required" },
        { status: 400 }
      );
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        storeId,
        productId: productId || null,
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        senderPhone: senderPhone?.trim() || null,
        subject: subject.trim(),
        message: message.trim(),
        status: "NEW",
      },
    });

    return NextResponse.json({ success: true, enquiry });
  } catch (error) {
    console.error("POST /api/enquiries error:", error);
    return NextResponse.json({ error: "Failed to submit enquiry" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "SELLER" || !user.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const enquiries = await prisma.enquiry.findMany({
      where: { storeId: user.storeId },
      include: {
        product: {
          select: { title: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ enquiries });
  } catch (error) {
    console.error("GET /api/enquiries error:", error);
    return NextResponse.json({ error: "Failed to fetch enquiries" }, { status: 500 });
  }
}
