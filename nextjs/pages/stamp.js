import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react'; // Ensure you're using useSession from next-auth
import withAuth from '@/hoc/withAuth';

function LoginWithEffect() {
  const [error, setError] = useState(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const logLoginHistory = async (userId) => {
      try {
        // Send request to log the login history with user_id
        const response = await axios.post('http://localhost:8000/data/login-history-stamp', { user_id: userId });
        console.log('Login history logged successfully:', response.data);

        // Redirect to /home after successful logging
        router.push('/home');
      } catch (error) {
        // Log the exact error response for debugging
        console.error('Failed to log login history:', error.response?.data || error.message);
        setError('Failed to log login history.');
      }
    };

    const fetchUserInfo = async () => {
      const token = localStorage.getItem('token'); // Check for token in localStorage

      if (status === 'authenticated' && session?.user?.email) {
        // Session-based authentication
        try {
          const response = await axios.get(`http://localhost:8000/auth/get-user-info/${session.user.email}`);
          const { access_token, user_id, is_admin } = response.data;

          // Store token and other details in localStorage
          localStorage.setItem('token', access_token);
          localStorage.setItem('user_id', user_id);
          localStorage.setItem('is_admin', is_admin);

          console.log('User data fetched and stored:', { access_token, user_id, is_admin });

          // Log the login history and redirect to /home
          logLoginHistory(user_id);
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log(error.response.data.detail);
            router.push('/register');
          } else {
            console.error('Failed to fetch user info:', error.response?.data || error.message);
            setError('Failed to fetch user info.');
          }
        }
      } else if (token) {
        // Token exists in localStorage, so fetch user_id from there
        const userId = localStorage.getItem('user_id');
        if (userId) {
          logLoginHistory(userId);
        } else {
          console.error('Token exists but user_id not found in localStorage.');
        }
      }
    };

    // Trigger fetchUserInfo based on session or token
    if (status === 'authenticated' || localStorage.getItem('token')) {
      fetchUserInfo();
    }
  }, [status, session, router]);

  return (
    <div>
      <h1>Logging in...</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default withAuth(LoginWithEffect);
