// pages/session-info.js
import { useSession } from 'next-auth/react';

const SessionInfo = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p>Loading session...</p>;
  }

  if (status === 'unauthenticated') {
    return <p>User is not authenticated. Please <a href="/login">log in</a>.</p>;
  }

  return (
    <div>
      <h1>Session Information</h1>
      {session ? (
        <div>
          <h2>User Info</h2>
          <p><strong>Name:</strong> {session.user.name}</p>
          <p><strong>Email:</strong> {session.user.email}</p>
          <p><strong>Access Token:</strong> {session.accessToken}</p>
          <h3>Full Session Data</h3>
          <pre>{JSON.stringify(session, null, 2)}</pre>
        </div>
      ) : (
        <p>No session data found.</p>
      )}
    </div>
  );
};

export default SessionInfo;
