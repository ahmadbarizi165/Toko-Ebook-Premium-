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

// Koneksi Database
mongoose.connect(process.env.DATABASE_URL);

// Konfigurasi Cloudinary
cloudinary.config({
    cloud_name: 'dvq18aq4p',
    api_key: '73295193389493',
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'toko_ebook_barizi' }
});
const upload = multer({ storage: storage });

// Model Order
const Order = mongoose.model('Order', new mongoose.Schema({
    nama: String, email: String, buku: String, buktiGambar: String, tanggal: { type: Date, default: Date.now }
}));

// Route Tampilan
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

// API Simpan Pesanan
app.post('/api/konfirmasi', upload.single('image'), async (req, res) => {
    try {
        const newOrder = new Order({
            nama: req.body.nama,
            email: req.body.email,
            buku: req.body.buku,
            buktiGambar: req.file.path
        });
        await newOrder.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API Ambil Data Pesanan
app.get('/api/orders', async (req, res) => {
    const orders = await Order.find().sort({ _id: -1 });
    res.json(orders);
});

module.exports = app;
    
