import clientPromise from './_db.js';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('temp_email');
  const collection = db.collection('domains');
  const SECRET_KEY = process.env.ADMIN_KEY || "admin123";

  // GET: Ambil daftar semua domain aktif
  if (req.method === 'GET') {
    try {
      const domainsDoc = await collection.find({ active: true }).toArray();
      const domainList = domainsDoc.map(d => d.domain);
      return res.status(200).json({ domains: [...new Set(domainList)] });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // POST: Tambah domain baru
  if (req.method === 'POST') {
    const { domain, adminKey } = req.body;

    if (adminKey !== SECRET_KEY) {
      return res.status(401).json({ error: 'Kunci Admin tidak valid!' });
    }

    if (!domain) {
      return res.status(400).json({ error: 'Nama domain wajib diisi!' });
    }

    try {
      const cleanDomain = domain.toLowerCase().trim().replace(/^(https?:\/\/)?(www\.)?/, '');
      await collection.updateOne(
        { domain: cleanDomain },
        { $set: { domain: cleanDomain, active: true, updatedAt: new Date() } },
        { upsert: true }
      );

      return res.status(200).json({ success: true, message: 'Domain berhasil ditambahkan!' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // DELETE: Hapus domain dari list
  if (req.method === 'DELETE') {
    const { domain, adminKey } = req.body;

    if (adminKey !== SECRET_KEY) {
      return res.status(401).json({ error: 'Kunci Admin tidak valid!' });
    }

    try {
      const cleanDomain = domain.toLowerCase().trim();
      await collection.deleteOne({ domain: cleanDomain });
      return res.status(200).json({ success: true, message: 'Domain berhasil dihapus!' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
