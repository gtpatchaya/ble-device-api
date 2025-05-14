import type { RequestHandler } from 'express';
import { Router } from 'express';
import passport from 'passport';
import { generateTokens, login, logout, refreshToken } from '../controllers/auth.controller';

const router = Router();

// Local authentication routes
router.post('/login', login as RequestHandler);
router.post('/refresh-token', refreshToken as RequestHandler);
router.post('/logout', logout as RequestHandler);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      const user = req.user as { id: string; email: string };
      
      // Generate JWT tokens
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
      });

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Redirect to frontend with access token
      res.send(tokens.accessToken)
     //res.redirect(
       // `${process.env.FRONTEND_URL}/auth/google/success?token=${}`
     // );
    } catch (error) {
      console.error('Google auth error:', error);
     // res.redirect(`${process.env.FRONTEND_URL}/auth/google/error`);
    }
  }
);

export default router; 