const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// 1. TAMPILAN OTOMATIS (Solusi Anti "Cannot GET /")
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. KONEKSI DATABASE
mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('✅ MongoDB Terhubung'))
    .catch(err => console.error('❌ Error MongoDB:', err));

// 3. KONFIGURASI CLOUDINARY
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'bukti_transfer' }
});
const upload = multer({ storage: storage });

// 4. MODEL DATA
const Order = mongoose.model('Order', new mongoose.Schema({
    nama: String, email: String, buku: String, buktiGambar: String, status: { type: String, default: 'Pending' }
}));
const Book = mongoose.model('Book', new mongoose.Schema({
    judul: String, harga: Number
}));

// 5. API ENDPOINTS
app.get('/api/books', async (req, res) => {
    const books = await Book.find();
    res.json(books);
});

app.post('/api/konfirmasi', upload.single('image'), async (req, res) => {
    try {
        const newOrder = new Order({
            nama: req.body.nama, email: req.body.email, buku: req.body.buku, buktiGambar: req.file.path
        });
        await newOrder.save();
        res.json({ message: 'Success' });
    } catch (err) { res.status(500).send(err); }
});

// 6. JALANKAN SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server aktif di port ${PORT}`));

module.exports = app; // PENTING UNTUK VERCEL
