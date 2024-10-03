import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import axios from 'axios';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [manualLoggedIn, setManualLoggedIn] = useState(false);
    const [manualUser, setManualUser] = useState(null);
    const [checkedLogin, setCheckedLogin] = useState(false);  // Add flag to check login only once

    const checkManualLogin = async () => {
      const token = localStorage.getItem('token');

      if (token && !checkedLogin) {
        try {
          const response = await axios.get('http://localhost:8000/user/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setManualUser(response.data);
          setManualLoggedIn(true);
        } catch (error) {
          localStorage.removeItem('token');
          router.push('/login');
        }
        setCheckedLogin(true);  // Mark login as checked to avoid re-fetch
      }
    };

    useEffect(() => {
      checkManualLogin();

      if (!session && !localStorage.getItem('token') && status !== 'loading') {
        router.push('/login');
      }
    }, [session, status, router, checkedLogin]);

    if (status === 'loading' || (!session && !manualLoggedIn)) {
      return <div>Loading...</div>;
    }

    return <WrappedComponent {...props} manualUser={manualUser} />;
  };
};

export default withAuth;
