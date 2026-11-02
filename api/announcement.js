import clientPromise from './_db.js';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('temp_email');
  const collection = db.collection('settings');
  const SECRET_KEY = process.env.ADMIN_KEY || "admin123";

  // GET: Pembacaan publik untuk menampilkan popup ke user
  if (req.method === 'GET') {
    try {
      const settings = await collection.findOne({ key: 'announcement' });
      return res.status(200).json(settings || { enabled: false, title: 'INFORMASI', text: '' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // POST: Pengaturan pengumuman dari Admin Dashboard
  if (req.method === 'POST') {
    const { enabled, title, text, adminKey } = req.body;

    if (adminKey !== SECRET_KEY) {
      return res.status(401).json({ error: 'Kunci Admin tidak valid!' });
    }

    try {
      await collection.updateOne(
        { key: 'announcement' },
        { 
          $set: { 
            key: 'announcement', 
            enabled: Boolean(enabled), 
            title: title || 'INFORMASI', 
            text: text || '', 
            updatedAt: new Date() 
          } 
        },
        { upsert: true }
      );

      return res.status(200).json({ success: true, message: 'Pengumuman diperbarui!' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
