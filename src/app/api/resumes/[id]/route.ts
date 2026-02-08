import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch single resume
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resume = await prisma.resume.findUnique({
        where: { id },
    });

    if (!resume || resume.userId !== userId) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(resume);
}

// PUT - Update resume (rename)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fileName, jobTitle } = body;

    const resume = await prisma.resume.findUnique({
        where: { id },
    });

    if (!resume || resume.userId !== userId) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updated = await prisma.resume.update({
        where: { id },
        data: {
            ...(fileName && { fileName }),
            ...(jobTitle !== undefined && { jobTitle }),
        },
    });

    return NextResponse.json(updated);
}

// DELETE - Remove resume
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resume = await prisma.resume.findUnique({
        where: { id },
    });

    if (!resume || resume.userId !== userId) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.resume.delete({
        where: { id },
    });

    return NextResponse.json({ success: true });
}
