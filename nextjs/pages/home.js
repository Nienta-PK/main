import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import withAuth from '@/hoc/withAuth';

function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (status === 'authenticated' && session?.user?.email) {
        try {
          const response = await axios.get(`http://localhost:8000/auth/get-user-info/${session.user.email}`);
          const { access_token, user_id, is_admin } = response.data;

          // Store data in localStorage
          localStorage.setItem('token', access_token);
          localStorage.setItem('user_id', user_id);
          localStorage.setItem('is_admin', is_admin);

          console.log('User data fetched and stored:', { access_token, user_id, is_admin });
        } catch (error) {
          if (error.response && error.response.status === 404) {
            // If user not found, redirect to /register
            console.log(error.response.data.detail);  // Log the custom error message
            router.push('/register');  // Redirect to the registration page
          } else {
            console.error('Failed to fetch user info:', error);
          }
        }
      }
    };

    fetchUserInfo();
  }, [status, session, router]);

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Home Page</h1>
    </div>
  );
}

export default withAuth(Home);

