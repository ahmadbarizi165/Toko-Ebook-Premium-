const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// 1. KONEKSI DATABASE
mongoose.connect(process.env.DATABASE_URL);

// 2. KONFIGURASI CLOUDINARY (Data Rahasia Barizi)
cloudinary.config({
    cloud_name: 'dvq18aq4p',
    api_key: '73295193389493',
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'bukti_pesanan_barizi' }
});
const upload = multer({ storage: storage });

// 3. MODEL DATA
const Order = mongoose.model('Order', new mongoose.Schema({
    nama: String, email: String, buku: String, buktiGambar: String, status: { type: String, default: 'Pending' }
}));

// 4. JALUR HALAMAN (Routes)
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

// 5. API UNTUK PESANAN
app.post('/api/konfirmasi', upload.single('image'), async (req, res) => {
    try {
        const orderBaru = new Order({
            nama: req.body.nama,
            email: req.body.email,
            buku: req.body.buku,
            buktiGambar: req.file.path // URL Gambar dari Cloudinary
        });
        await orderBaru.save();
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/orders', async (req, res) => {
    const data = await Order.find().sort({ _id: -1 });
    res.json(data);
});

module.exports = app;
