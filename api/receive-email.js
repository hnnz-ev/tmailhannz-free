import clientPromise from './_db.js';
import PostalMime from 'postal-mime';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, from, subject, body } = req.body;

    if (!to) {
      return res.status(400).json({ error: 'Alamat email penerima wajib ada' });
    }

    let cleanBody = body;
    let parsedSubject = subject;

    // Parsing raw MIME email agar header terhapus dan tersisa teks bersih/HTML
    if (body && typeof body === 'string') {
      try {
        const parser = new PostalMime();
        const parsed = await parser.parse(body);
        cleanBody = parsed.text || parsed.html || body;
        if (parsed.subject) parsedSubject = parsed.subject;
      } catch (err) {
        console.log("Parsing fallback", err);
      }
    }

    const client = await clientPromise;
    const db = client.db('temp_email');
    const collection = db.collection('messages');

    await collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 });

    await collection.insertOne({
      recipient: to.toLowerCase().trim(),
      sender: from || 'Unknown',
      subject: parsedSubject || '(Tanpa Subjek)',
      body: cleanBody || '(Pesan Kosong)',
      createdAt: new Date()
    });

    return res.status(200).json({ success: true, message: 'Email tersimpan' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
