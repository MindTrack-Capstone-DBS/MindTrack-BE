const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
require('dotenv').config();

exports.register = async (req, res) => {
  try {
    // Validasi input
    if (!req.body.name || !req.body.email || !req.body.password) {
      return res.status(400).send({
        message: 'Nama, email, dan password harus diisi!',
      });
    }

    // Periksa apakah email sudah terdaftar
    const existingUser = await User.findByEmail(req.body.email);
    if (existingUser) {
      return res.status(400).send({
        message: 'Email sudah terdaftar!',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Buat user baru
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone || null,
      password: hashedPassword,
    });

    // Simpan user ke database
    const savedUser = await User.create(user);

    // Buat token
    const token = jwt.sign({ id: savedUser.id }, process.env.JWT_SECRET || 'mindtrack-secret-key', { expiresIn: '24h' });

    // Kirim respons
    res.status(201).send({
      message: 'User berhasil terdaftar!',
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        phone: savedUser.phone,
      },
      token: token,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send({
      message: 'Terjadi kesalahan saat mendaftarkan user!',
    });
  }
};

exports.login = async (req, res) => {
  try {
    // Validasi input
    if (!req.body.email || !req.body.password) {
      return res.status(400).send({
        message: 'Email dan password harus diisi!',
      });
    }

    // Cari user berdasarkan email
    const user = await User.findByEmail(req.body.email);
    if (!user) {
      return res.status(404).send({
        message: 'User tidak ditemukan!',
      });
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send({
        message: 'Password tidak valid!',
      });
    }

    // Buat token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'mindtrack-secret-key', { expiresIn: '24h' });

    // Kirim respons
    res.status(200).send({
      message: 'Login berhasil!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      token: token,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send({
      message: 'Terjadi kesalahan saat login!',
    });
  }
};
