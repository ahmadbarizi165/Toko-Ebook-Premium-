const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const app = express();
app.use(express.json());
app.use(cors());

// --- KONEKSI DATABASE ---
// Pastikan DATABASE_URL sudah ada di Environment Variables Vercel
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log("MongoDB Terhubung"))
    .catch(err => console.error("Gagal Koneksi Database:", err));

// --- KONFIGURASI CLOUDINARY BARIZI ---
cloudinary.config({
    cloud_name: 'dvq18aq4p',
    api_key: '73295193389493',
    api_secret: process.env.CLOUDINARY_API_SECRET // Diambil dari Saved Info
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'toko_ebook_premium',
        allowed_formats: ['jpg', 'png', 'jpeg']
    }
});
const upload = multer({ storage: storage });

// --- MODEL DATA ---
const OrderSchema = new mongoose.Schema({
    nama: String,
    email: String,
    buku: String,
    buktiGambar: String,
    status: { type: String, default: 'Menunggu Verifikasi' },
    tanggal: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', OrderSchema);

// --- ROUTES TAMPILAN (FRONTEND) ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/kode_rahasia_barizi', (req, res) => res.sendFile(path.join(__dirname, 'kode_rahasia_barizi.html')));

// --- API ROUTES (BACKEND) ---

// 1. Simpan Pesanan Baru + Upload Bukti
app.post('/api/konfirmasi', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "Bukti transfer harus diunggah" });

        const orderBaru = new Order({
            nama: req.body.nama,
            email: req.body.email,
            buku: req.body.buku,
            buktiGambar: req.file.path // URL dari Cloudinary
        });

        await orderBaru.save();
        res.json({ success: true, message: "Pesanan berhasil disimpan!" });
    } catch (err) {
        res.status(500).json({ error: "Terjadi kesalahan server: " + err.message });
    }
});

// 2. Ambil Semua Pesanan untuk Admin
app.get('/api/orders', async (req, res) => {
    try {
        const data = await Order.find().sort({ tanggal: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Export untuk Vercel
module.exports = app;
                            
