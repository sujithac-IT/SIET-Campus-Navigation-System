import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_USERS } from '@/lib/data/seedData';

export async function POST(req: NextRequest) {
  try {
    const { email, registerNumber, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const user = INITIAL_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() || (u as any).registerNumber === registerNumber
    );

    if (!user) {
      return NextResponse.json({ error: 'Invalid college credentials or user not registered.' }, { status: 401 });
    }

    // Set secure session cookie (HttpOnly)
    const response = NextResponse.json({
      status: 'success',
      message: 'Authentication successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

    response.cookies.set('campus_session', `session_${user.id}_${Date.now()}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: 'Login failed', details: err.message }, { status: 500 });
  }
}
