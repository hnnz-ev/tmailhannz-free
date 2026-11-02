# ⚡ TempMail Service - Script Temporary Email Scalable

Aplikasi layanan email sementara (*Temporary Email*) modern dengan desain **Neo-Brutalist**, mendukung custom username, multi-domain, dark mode, dan auto-delete inbox menggunakan MongoDB Atlas, Vercel, dan Cloudflare Workers.

---

## 📌 Prasyarat Bebas Biaya (100% Free Tier)
Sebelum memulai, pastikan Anda sudah mendaftar akun gratis di platform berikut:
1. **GitHub** (untuk menyimpan repositori kode)
2. **Vercel** (untuk hosting backend & frontend)
3. **MongoDB Atlas** (untuk database penyimpan pesan)
4. **Cloudflare** (untuk pendaftaran domain & Email Routing)

---

## 🚀 Panduan Pemasangan Step-by-Step

### LANGKAH 1: Setup Database (MongoDB Atlas)
1. Login ke [MongoDB Atlas](https://cloud.mongodb.com/).
2. Buat **Database Cluster** baru (Pilih **M0 Free Tier**, Region: *Singapore*).
3. Atur **Network Access**:
   * Masuk ke menu **Security** > **Network Access**.
   * Klik **Add IP Address** > Pilih **Allow Access from Anywhere** atau isi dengan ip ini"0.0.0.0/0" kemudian Klik **Confirm**.
4. Ambil **Connection String**:
   * Kembali ke menu **Database** > Klik tombol **Connect** pada cluster Anda.
   * Pilih opsi **Drivers** (Node.js).
   * Salin kode URL koneksi yang tampil, contoh:
     `mongodb+srv://username:<password>@cluster0.xxxx.mongodb.net/`
   * **PENTING:** Ganti `<password>` dengan password user database Anda. Simpan teks ini.
note: jangan lupa copy username cluster dan password cluster saat ambil connection string
---

### LANGKAH 2: Upload Script & Deploy ke Vercel
1. Extrak file `.zip` ini, lalu *upload* seluruh folder proyek ini ke akun **GitHub** Anda.
2. Login ke dashboard [Vercel](https://vercel.com/).
3. Klik tombol **Add New...** > **Project** > Pilih repositori GitHub proyek ini.
4. Sebelum menekan tombol Deploy, buka bagian **Environment Variables**:
   isi:
   * Key: `MONGODB_URI`
     Value: [Paste Connection String MongoDB Atlas Anda]
   * Key: `ADMIN_KEY`
     Value: [Ketik kata sandi rahasia Anda untuk akses fitur Admin Domain, misal: admin123]. ini digunakan untuk menambahkan domain ke list dropdown domain 
5. Klik **Deploy** dan tunggu beberapa detik hingga proses selesai.
6. Salin domain utama Vercel Anda (misal: `https://tmailweb.vercel.app` atau domain pribadi Anda).

---

### LANGKAH 3: Setting Cloudflare Worker (Penerima Email)
1. Login ke dashboard [Cloudflare](https://dash.cloudflare.com/).
2. Pilih menu **Workers & Pages** > **Create Application** > **Create Worker**.
3. Beri nama Worker (misal: `temp-email-worker`), lalu klik **Deploy**.
4. Klik **Edit Code**, hapus semua kode lama, lalu *paste* kode di bawah ini:

```javascript
export default {
  async email(message, env, ctx) {
    const to = message.to;
    const from = message.from;
    const subject = message.headers.get("subject") || "(Tanpa Subjek)";
    
    // Membaca isi teks mentah email
    const rawEmail = await new Response(message.raw).text();

    // Kirim data email ke API Vercel Anda
    await fetch("https://ganti pakai-domainkamu atau domain vercel/api/receive-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: to,
        from: from,
        subject: subject,
        body: rawEmail
      })
    });
  }
};
```
## Setting Custom Domain di Vercel & Cloudflare DNS
### LANGKAH 1: Menambahkan Domain di Dashboard Vercel
  1. Login ke dashboard Vercel dan buka proyek tmailweb Anda.
  2. Buka menu Settings > pilih tab Domains di sebelah kiri.
  3. Pada kolom Domain Name, masukkan nama domain pribadi Anda:
  4. Domain Utama: domainanda.com
Klik tombol Add.

Vercel akan menampilkan status Invalid Configuration beserta detail DNS Record yang perlu Anda masukkan ke Cloudflare.

### LANGKAH 2: Konfigurasi DNS Record di Cloudflare
  1. Login ke dashboard Cloudflare dan pilih nama domain Anda.
  2. Di sidebar sebelah kiri, buka menu DNS > Records.
  3. Klik tombol Add record dan masukkan data sesuai jenis domain yang Anda daftarkan di Vercel:

//A. Jika Menggunakan Domain Utama (domainanda.com):
buat record:
  * Type: A
  * Name: @ (atau domainanda.com)
  * IPv4 address: 76.76.21.21
  * Proxy status: DNS only (Klik ikon awan Oranye agar berubah menjadi Abu-abu/Gray. Hal ini wajib agar Vercel bisa menerbitkan sertifikat SSL SSL/HTTPS otomatis).
Klik Save.

atau buat record:
  * Type: CNAME
  * Name: @
  * Target: [isi kode target yang diberikan oleh vercel]
  * Proxy status: DNS Only (Awan Abu')

B. Jika Menggunakan Subdomain (tempmail.domainanda.com):
buat record:
  * Type: CNAME
  * Name: tempmail
  * Target: cname.vercel-dns.com
  * Proxy status: DNS only (Awan Abu-abu/Gray).
Klik Save.
Tunggu 1–5 menit hingga status di dashboard Vercel berubah menjadi hijau dengan tulisan Active.
