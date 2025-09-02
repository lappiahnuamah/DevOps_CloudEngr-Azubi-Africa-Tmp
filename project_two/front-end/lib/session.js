// // this file is a wrapper with defaults to be used in both API routes and `getServerSideProps` functions
// import { withIronSession } from 'next-iron-session'

// export default function withSession(handler) {
//     return withIronSession(handler, {
//         password: process.env.SECRET_COOKIE_PASSWORD,
//         cookieName: 'clm.mw',
//         cookieOptions: {
//             secure: process.env.NODE_ENV === 'production',
//         },
//     })
// }

import { withIronSession } from 'next-iron-session';

export default function withSession(handler) {
  // For build-time pages that don't need session, skip session configuration
  if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
    // During build, some pages might not need session
    try {
      return withIronSession(handler, {
        password: process.env.SESSION_SECRET || 'github-actions-build-secret-minimum-32-characters-long-for-security',
        cookieName: 'clms-session',
        cookieOptions: {
          secure: false, // Set to false for build time
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 1 week
        },
      });
    } catch (error) {
      console.warn('Session configuration skipped during build:', error.message);
      return handler;
    }
  }

  return withIronSession(handler, {
    password: process.env.SESSION_SECRET || 'local-development-secret-minimum-32-characters-long',
    cookieName: 'clms-session',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    },
  });
}