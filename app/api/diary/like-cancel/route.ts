import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../prisma/client';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../lib/token';

export async function POST(req: NextRequest) {
  const { diaryId } = await req.json();
  try {
    const userId = verifyToken(
      cookies().get('dreaming_accessToken')?.value ?? ''
    ).userId;
  } catch (e) {
    return new Response(
      JSON.stringify({
        error: '토큰이 만료되었습니다.',
      }),
      {
        status: 401,
      }
    );
  }
  try {
    const getDiary = await prisma.diary.findUnique({
      where: {
        id: diaryId,
      },
    });
    if (getDiary?.like === 0) {
      return new Response(
        JSON.stringify({
          error: '좋아요 취소를 할 수 없어요',
        }),
        {
          status: 502,
        }
      );
    }
    const getDiaryLikesNumber = await prisma.diary.update({
      where: {
        id: diaryId,
      },
      data: {
        like: (getDiary?.like as number) - 1,
      },
    });

    return NextResponse.json(JSON.stringify(getDiaryLikesNumber), {
      status: 200,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: '다이어리 좋아요 취소를 할 수 없어요',
      },
      {
        status: 502,
      }
    );
  }
}