import clientPromise from './_db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: 'Parameter address dibutuhkan' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('temp_email');
    const collection = db.collection('messages');

    const messages = await collection
      .find({ recipient: address.toLowerCase().trim() })
      .sort({ createdAt: -1 })
      .limit(30)
      .toArray();

    return res.status(200).json({ messages });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
