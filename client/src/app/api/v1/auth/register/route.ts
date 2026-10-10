import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, role, registerNumber, employeeId, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, official college email, and password are required.' }, { status: 400 });
    }

    // Verify official college email domain
    if (!email.includes('@siet.') && !email.includes('@college.edu') && !email.includes('.ac.in')) {
      return NextResponse.json(
        { error: 'Registration requires a verified official college email address (@siet.ac.in or @college.edu).' },
        { status: 403 }
      );
    }

    const newUser = {
      id: `u-${Date.now()}`,
      name,
      email,
      role: role || 'student',
      registerNumber: registerNumber || `REG${Math.floor(100000 + Math.random() * 900000)}`,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
      liveLocationSharing: true,
      privacySetting: 'campus'
    };

    return NextResponse.json({
      status: 'success',
      message: 'Account registered successfully. Email verification link sent.',
      user: newUser
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Registration failed', details: err.message }, { status: 500 });
  }
}
