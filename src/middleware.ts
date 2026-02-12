import { NextRequest, NextResponse } from 'next/server';

const publicRoutes = [
    '/signin',         
    '/admin/signin',  
];

const homeRoutes: Record<string, string> = {
    '1': '/admin/dashboard',       
    '2': '/student/payment-lists',
};

const rolePermissions: Record<string, string[]> = {
    '1': ['/admin', '/profile'],   
    '2': ['/student', '/profile'],
};

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('cookieKey')?.value;
    const userRole = request.cookies.get('role')?.value; 
    const isPaymentPage = pathname.startsWith('/payment');
    const isPublicRoute = publicRoutes.includes(pathname) || isPaymentPage;

    if (pathname === '/') {
        return NextResponse.redirect(new URL('/signin', request.url));
    }

    if (!token) {
        if (isPublicRoute) {
            return NextResponse.next();
        }

        if (pathname.startsWith('/admin')) {
            return NextResponse.redirect(new URL('/admin/signin', request.url));
        }

        return NextResponse.redirect(new URL('/signin', request.url));
    }

    if (publicRoutes.includes(pathname) || pathname === '/') {
        const destination = homeRoutes[userRole || ''] || '/signin'; 
        return NextResponse.redirect(new URL(destination, request.url));
    }

    if (!isPaymentPage) {
        const allowedPrefixes = rolePermissions[userRole || ''] || [];
        const hasPermission = allowedPrefixes.some(prefix => pathname.startsWith(prefix));

        if (!hasPermission) {
            const home = homeRoutes[userRole || ''] || '/signin';
            return NextResponse.redirect(new URL(home, request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico).*)'],
};