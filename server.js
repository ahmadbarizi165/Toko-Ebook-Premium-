const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const app = express();

// 1. MIDDLEWARE (WAJIB DI ATAS)
app.use(express.json());
app.use(cors());
// Menghubungkan file statis (agar index.html dan kode_rahasia_barizi.html bisa dibaca)
app.use(express.static(path.join(__dirname, '/')));

// 2. KONEKSI DATABASE
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log("Database Barizi Aktif"))
    .catch(err => console.error("Database Error:", err));

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

// 4. MODEL DATA
const Order = mongoose.model('Order', new mongoose.Schema({
    nama: String,
    email: String,
    buku: String,
    buktiGambar: String,
    tanggal: { type: Date, default: Date.now }
}));

// 5. JALUR TAMPILAN (FRONTEND)
// Halaman Utama
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Halaman Admin Rahasia
app.get('/kode_rahasia_barizi', (req, res) => {
    res.sendFile(path.join(__dirname, 'kode_rahasia_barizi.html'));
});

// 6. JALUR DATA (API BACKEND)
// Simpan Pesanan
app.post('/api/konfirmasi', upload.single('image'), async (req, res) => {
    try {
        const order = new Order({
            nama: req.body.nama,
            email: req.body.email,
            buku: req.body.buku,
            buktiGambar: req.file.path
        });
        await order.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Ambil Data Pesanan untuk Admin
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
           
