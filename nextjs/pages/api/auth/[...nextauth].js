// --- pages/api/auth/[...nextauth].js ---
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

export default NextAuth({
  providers: [
    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // Credentials Provider for Manual Login
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Email', type: 'text', placeholder: 'test@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Use URLSearchParams to encode form data
          const formData = new URLSearchParams();
          formData.append('username', credentials.username);  // The key should match what your FastAPI expects
          formData.append('password', credentials.password);

          // Send a POST request to your FastAPI backend
          const response = await axios.post(
            'http://fastapi:8000/auth/login',
            formData,
            {
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }
          );

          const data = response.data;

          if (data && data.access_token) {
            // Return user object to be saved in session
            return {
              name: credentials.username,  // Adjust as needed
              accessToken: data.access_token,
            };
          } else {
            return null;
          }
        } catch (error) {
          console.error('Authorize error:', error);
          throw new Error('Invalid email or password');
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = user.accessToken || token.accessToken;
        token.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user = token.user || session.user;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  debug: true,
});
