const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const app = express();

// 1. MIDDLEWARE
app.use(express.json());
app.use(cors());

// 2. KONEKSI DATABASE (MONGODB)
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log("Database Barizi Terhubung"))
    .catch(err => console.error("Gagal Koneksi Database:", err));

// 3. KONFIGURASI CLOUDINARY
cloudinary.config({
    cloud_name: 'dvq18aq4p',
    api_key: '73295193389493',
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'toko_ebook_premium',
        allowed_formats: ['jpg', 'png', 'jpeg']
    }
});
const upload = multer({ storage: storage });

// 4. MODEL DATA PESANAN
const Order = mongoose.model('Order', new mongoose.Schema({
    nama: String,
    email: String,
    buku: String,
    buktiGambar: String,
    tanggal: { type: Date, default: Date.now }
}));

// 5. JALUR TAMPILAN (FRONTEND)
// Menggunakan ../ agar server bisa keluar dari folder 'api' untuk mencari file HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/kode_rahasia_barizi', (req, res) => {
    res.sendFile(path.join(__dirname, '../kode_rahasia_barizi.html'));
});

// 6. API BACKEND
// Jalur Simpan Pesanan & Upload Gambar
app.post('/api/konfirmasi', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "Bukti transfer harus diunggah" });

        const order = new Order({
            nama: req.body.nama,
            email: req.body.email,
            buku: req.body.buku,
            buktiGambar: req.file.path
        });

        await order.save();
        res.json({ success: true, message: "Pesanan berhasil disimpan!" });
    } catch (err) {
        res.status(500).json({ error: "Gagal: " + err.message });
    }
});

// Jalur Ambil Pesanan untuk Admin
app.get('/api/orders', async (req, res) => {
    try {
        const data = await Order.find().sort({ _id: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. EXPORT UNTUK VERCEL
module.exports = app;

