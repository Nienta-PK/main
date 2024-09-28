// withAuth.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [manualLoggedIn, setManualLoggedIn] = useState(false);

    useEffect(() => {
      const token = localStorage.getItem('token');  // Check for manual token

      // If no session and no token, redirect to login
      if (!session && !token && status !== 'loading') {
        router.push('/login');
      }

      // If a token exists, set the manual login state to true
      if (token) {
        setManualLoggedIn(true);
      }
    }, [session, status, router]);

    // Show a loading state while checking NextAuth session or manual token
    if (status === 'loading' || (!session && !manualLoggedIn)) {
      return <div>Loading...</div>;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
