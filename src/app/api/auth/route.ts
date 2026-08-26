import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { hashPassword, verifyPassword } from '@/lib/auth-helpers';

// Generate simple session token
function generateToken(userId: string): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  return Buffer.from(`${userId}-${timestamp}-${random}`).toString('base64');
}

// In-memory session storage (for production, use Redis or database)
const sessions = new Map<string, { userId: string; expiresAt: number }>();

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// GET /api/auth/me - Get current user
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value ||
                  request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const session = sessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
      if (session) sessions.delete(token);
      return NextResponse.json(
        { success: false, error: 'Session expired' },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      include: {
        department: {
          select: { id: true, name: true, code: true }
        }
      }
    });

    if (!user || !user.isActive) {
      sessions.delete(token);
      return NextResponse.json(
        { success: false, error: 'User not found or inactive' },
        { status: 401 }
      );
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId,
        departmentName: user.department?.name,
        avatar: user.avatar,
        phone: user.phone,
        isAuthenticated: true
      }
    });
  } catch (error) {
    console.error('Auth GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/auth/login - Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, action } = body;

    // Handle registration action
    if (action === 'register') {
      return handleRegistration(body);
    }

    // Handle logout action
    if (action === 'logout') {
      return handleLogout(request);
    }

    // Login validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        department: {
          select: { id: true, name: true, code: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account is deactivated. Contact administrator.' },
        { status: 403 }
      );
    }

    // Generate token and create session
    const token = generateToken(user.id);
    sessions.set(token, {
      userId: user.id,
      expiresAt: Date.now() + SESSION_DURATION
    });

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entityType: 'USER',
        entityId: user.id,
        newValue: JSON.stringify({ loginTime: new Date().toISOString() }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    const response = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId,
        departmentName: user.department?.name,
        avatar: user.avatar,
        phone: user.phone,
        isAuthenticated: true
      },
      token
    });

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Auth POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/auth/logout - Logout
export async function DELETE(request: NextRequest) {
  return handleLogout(request);
}

// Registration handler
async function handleRegistration(body: Record<string, unknown>) {
  const { name, email, password, role, departmentId, phone } = body;

  // Validation
  if (!name || !email || !password) {
    return NextResponse.json(
      { success: false, error: 'Name, email, and password are required' },
      { status: 400 }
    );
  }

  if (typeof password !== 'string' || password.length < 6) {
    return NextResponse.json(
      { success: false, error: 'Password must be at least 6 characters' },
      { status: 400 }
    );
  }

  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: { email: (email as string).toLowerCase() }
  });

  if (existingUser) {
    return NextResponse.json(
      { success: false, error: 'User with this email already exists' },
      { status: 409 }
    );
  }

  // Validate role
  const validRoles: UserRole[] = ['ADMIN', 'HOD', 'STAFF', 'STUDENT'];
  const userRole = (role as UserRole)?.toUpperCase() || 'STAFF';
  if (!validRoles.includes(userRole)) {
    return NextResponse.json(
      { success: false, error: 'Invalid role specified' },
      { status: 400 }
    );
  }

  // Hash password
  const hashedPassword = await hashPassword(password as string);

  // Create user
  const newUser = await db.user.create({
    data: {
      name: name as string,
      email: (email as string).toLowerCase(),
      password: hashedPassword,
      role: userRole,
      departmentId: departmentId as string | undefined,
      phone: phone as string | undefined,
    },
    include: {
      department: {
        select: { id: true, name: true, code: true }
      }
    }
  });

  // Create audit log
  await db.auditLog.create({
    data: {
      userId: newUser.id,
      action: 'REGISTER',
      entityType: 'USER',
      entityId: newUser.id,
      newValue: JSON.stringify({ 
        name: newUser.name, 
        email: newUser.email, 
        role: newUser.role 
      })
    }
  });

  return NextResponse.json({
    success: true,
    data: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      departmentId: newUser.departmentId,
      departmentName: newUser.department?.name,
      isAuthenticated: true
    },
    message: 'User registered successfully'
  }, { status: 201 });
}

// Logout handler
async function handleLogout(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value;

    if (token && sessions.has(token)) {
      const session = sessions.get(token);
      
      // Create audit log for logout
      if (session) {
        await db.auditLog.create({
          data: {
            userId: session.userId,
            action: 'LOGOUT',
            entityType: 'USER',
            entityId: session.userId
          }
        }).catch(() => {}); // Ignore errors in audit logging
      }
      
      sessions.delete(token);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear cookie
    response.cookies.delete('auth-token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Error during logout' },
      { status: 500 }
    );
  }
}
