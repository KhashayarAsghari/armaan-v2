import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { consultationRequests } from '@/lib/schema';

const uploadedFileSchema = z.object({
  name: z.string().min(1).max(255),
  url: z.string().min(1).max(1024),
  size: z.number().int().nonnegative(),
  type: z.string().min(1).max(120),
});

const schema = z.object({
  locale: z.enum(['fa', 'en', 'ar']).default('fa'),
  serviceType: z.enum([
    'customsBrokerage',
    'tradeConsulting',
    'legalConsulting',
    'transportServices',
    'specializedTraining',
  ]),
  subject: z.string().min(10),
  fullName: z.string().min(2).max(255),
  companyName: z.string().max(255).optional().nullable(),
  phone: z.string().min(8).max(50),
  email: z.string().email().max(255),
  city: z.string().min(2).max(255),
  responseMethods: z.array(z.enum(['phone', 'online', 'inPerson'])).min(1),
  uploadLink: z.string().max(1024).optional().nullable(),
  uploadedFiles: z.array(uploadedFileSchema).max(5).optional().default([]),
  consent: z.literal(true),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const inserted = await db.insert(consultationRequests).values({
      locale: data.locale,
      serviceType: data.serviceType,
      subject: data.subject,
      fullName: data.fullName,
      companyName: data.companyName?.trim() || null,
      phone: data.phone,
      email: data.email,
      city: data.city,
      responseMethods: JSON.stringify(data.responseMethods),
      uploadLink: data.uploadLink?.trim() || null,
      uploadedFiles: data.uploadedFiles.length > 0 ? JSON.stringify(data.uploadedFiles) : null,
      consent: true,
    });

    return NextResponse.json({ success: true, id: inserted[0].insertId }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 422 });
    }
    console.error('[consultation POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
