import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from '../prismaClient';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: '/api/v1/auth/google/callback',
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.emails?.[0].value },
        });

        if (existingUser) {
          return done(null, existingUser);
        }

        // If user doesn't exist, create new user
        const newUser = await prisma.user.create({
          data: {
            email: profile.emails?.[0].value as string,
            name: profile.displayName,
            password: '', // Empty password for Google users
            provider: 'google',
          },
        });

        return done(null, newUser);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

// Serialize user for the session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    done(error as Error);
  }
}); 