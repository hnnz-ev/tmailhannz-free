import clientPromise from './_db.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, address } = req.body;
    const client = await clientPromise;
    const db = client.db('temp_email');
    const collection = db.collection('messages');

    // 1. Hapus satu pesan berdasarkan ID
    if (id) {
      await collection.deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({ success: true, message: 'Pesan berhasil dihapus' });
    }

    // 2. Hapus seluruh inbox berdasarkan alamat email
    if (address) {
      await collection.deleteMany({ recipient: address.toLowerCase().trim() });
      return res.status(200).json({ success: true, message: 'Semua pesan inbox berhasil dibersihkan' });
    }

    return res.status(400).json({ error: 'Parameter id atau address wajib diisi!' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
