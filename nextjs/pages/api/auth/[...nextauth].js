// --- pages/api/auth/[...nextauth].js ---
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';

export default NextAuth({
  providers: [
    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        // If Google account, include token and user data
        token.accessToken = user.accessToken || token.accessToken;
        token.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      // Pass accessToken and user data into session
      session.accessToken = token.accessToken;
      session.user = token.user || session.user;
      return session;
    },
  },
  pages: {
    signIn: '/login',  // Your custom login page
  },
  debug: true,  // Enable debug mode (optional)
});
