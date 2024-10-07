import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session || !session.user.is_admin) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const response = await fetch(`${process.env.BACKEND_URL}/crud/users`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`, // Assumes the session stores the token
      },
    });

    if (response.ok) {
      const data = await response.json();
      return res.status(200).json(data);
    } else {
      return res.status(response.status).json({ error: "Failed to fetch users" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
