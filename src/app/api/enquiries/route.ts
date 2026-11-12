import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { callSupabaseEdgeFunction, createClient } from "@/lib/supabase/server";
import { type DbRow, mapEnquiry } from "@/lib/supabase/mappers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storeId, productId, senderName, senderEmail, senderPhone, subject, message } = body;

    if (!storeId || !senderName || !senderEmail || !subject || !message) {
      return NextResponse.json(
        { error: "Store, name, email, subject, and message are required." },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured()) {
      // Prefer Supabase Edge Function for validation & notification hook; fall back cleanly to DB insert
      const fnResult = await callSupabaseEdgeFunction<{ success: boolean; enquiry: DbRow }>(
        "enquiry-notify",
        {
          method: "POST",
          body: { storeId, productId, senderName, senderEmail, senderPhone, subject, message },
        }
      );

      if (fnResult.ok && fnResult.data?.enquiry) {
        return NextResponse.json({ enquiry: mapEnquiry(fnResult.data.enquiry) }, { status: 201 });
      }

      const supabase = await createClient();
      const { data: enquiry, error } = await supabase
        .from("enquiries")
        .insert({
          store_id: storeId,
          product_id: productId || null,
          sender_name: String(senderName).trim(),
          sender_email: String(senderEmail).trim().toLowerCase(),
          sender_phone: senderPhone ? String(senderPhone).trim() : null,
          subject: String(subject).trim(),
          message: String(message).trim(),
          status: "NEW",
        })
        .select("*")
        .single();

      if (error || !enquiry) {
        return NextResponse.json(
          { error: error?.message || "Failed to send enquiry." },
          { status: 400 }
        );
      }

      return NextResponse.json({ enquiry: mapEnquiry(enquiry) }, { status: 201 });
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        storeId,
        productId: productId || null,
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim().toLowerCase(),
        senderPhone: senderPhone?.trim() || null,
        subject: subject.trim(),
        message: message.trim(),
        status: "NEW",
      },
    });

    return NextResponse.json({ enquiry }, { status: 201 });
  } catch (error) {
    console.error("Enquiry POST error:", error);
    return NextResponse.json({ error: "Failed to send enquiry." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!isOwner(user) || !user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { data: rows, error } = await supabase
        .from("enquiries")
        .select(`
          *,
          products (id, title, slug)
        `)
        .eq("store_id", user.storeId)
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({ error: "Failed to load enquiries" }, { status: 500 });
      }

      return NextResponse.json({ enquiries: (rows ?? []).map(mapEnquiry) });
    }

    const enquiries = await prisma.enquiry.findMany({
      where: { storeId: user.storeId },
      include: { product: { select: { id: true, title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ enquiries });
  } catch (error) {
    console.error("Enquiries GET error:", error);
    return NextResponse.json({ error: "Failed to load enquiries" }, { status: 500 });
  }
}
