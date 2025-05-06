import { OAuth2Client } from 'google-auth-library';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { token } = req.body;

    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
      });
      const payload = ticket.getPayload();
      res.status(200).json({ payload });
    } catch (error) {
      res.status(400).json({ error: 'Token verification failed' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
