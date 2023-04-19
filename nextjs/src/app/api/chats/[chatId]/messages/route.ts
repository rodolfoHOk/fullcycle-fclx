import { prisma } from '../../../../prisma/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  const messages = await prisma.message.findMany({
    where: {
      chat_id: params.chatId,
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  return NextResponse.json(messages);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  const chat = await prisma.chat.findUniqueOrThrow({
    where: {
      id: params.chatId,
    },
  });

  const body = await request.json();

  const messageCreated = await prisma.message.create({
    data: {
      chat_id: chat.id,
      content: body.message,
    },
  });

  return NextResponse.json(messageCreated);
}
