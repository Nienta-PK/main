// withAuth.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === 'loading') {
        // Optionally show a loading indicator
        return;
      }

      if (!session) {
        // User is not authenticated, redirect to login
        router.push('/login');
      }
    }, [session, status, router]);

    if (status === 'loading') {
      return <div>Loading...</div>;
    }

    if (!session) {
      return null; // Render nothing while redirecting
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;

