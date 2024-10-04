import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Email', type: 'text', placeholder: 'test@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const formData = new URLSearchParams();
          formData.append('username', credentials.username);
          formData.append('password', credentials.password);

          const response = await axios.post(
            'http://localhost:8000/auth/login', // or use `process.env.BACKEND_URL` if set
            formData,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
          );

          const data = response.data;
          if (data && data.access_token) {
            return {
              name: credentials.username,
              accessToken: data.access_token,
              userId: data.user_id, // Assuming user_id is returned
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
    async signIn({ user, account }) {
      if (account.provider === 'google') {
        const { email, name } = user;
        try {
          const response = await axios.get(`${process.env.BACKEND_URL}/crud/users`, {
            params: { email },
          });

          if (!response.data.exists) {
            await axios.post(`${process.env.BACKEND_URL}/auth/register`, {
              email,
              name,
              password: 'GoogleAuthPassword123!' // Provide a default password if required
            });
          }
        } catch (error) {
          console.error("Error during sign-in callback:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = user.accessToken || token.accessToken;
        token.userId = user.userId || token.userId;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.id = token.userId;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  debug: true,
});
