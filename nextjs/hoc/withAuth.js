import { useEffect } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '../components/axiosInstance'; // Import your axios instance

const withAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Verify the token by calling a protected route
      axiosInstance.get('/protected-route')
        .then(() => {
          // Token is valid, proceed with rendering the page
        })
        .catch(() => {
          // Invalid token, redirect to login
          router.push('/login');
        }); 
    }, [router]);

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
