const User = require('../models/user.model');
const bcrypt = require('bcrypt');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({
        message: 'User tidak ditemukan!',
      });
    }

    res.status(200).send({
      user: user,
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).send({
      message: 'Terjadi kesalahan saat mengambil profil!',
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const userData = {};

    // Validasi dan persiapkan data yang akan diupdate
    if (req.body.name) userData.name = req.body.name;
    if (req.body.phone) userData.phone = req.body.phone;
    if (req.body.profile_image) userData.profile_image = req.body.profile_image;
    if (req.body.stress_level) userData.stress_level = req.body.stress_level;

    // Update password jika ada
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(req.body.password, salt);
    }

    // Update email hanya jika berbeda dan belum digunakan
    if (req.body.email) {
      const user = await User.findById(userId);
      if (user.email !== req.body.email) {
        const existingUser = await User.findByEmail(req.body.email);
        if (existingUser) {
          return res.status(400).send({
            message: 'Email sudah digunakan!',
          });
        }
        userData.email = req.body.email;
      }
    }

    const updated = await User.update(userId, userData);

    if (!updated) {
      return res.status(404).send({
        message: 'User tidak ditemukan atau tidak ada perubahan!',
      });
    }

    const updatedUser = await User.findById(userId);

    res.status(200).send({
      message: 'Profil berhasil diperbarui!',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).send({
      message: 'Terjadi kesalahan saat memperbarui profil!',
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    // Validasi input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password dan new password harus diisi',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password baru minimal 6 karakter',
      });
    }

    // Ambil user dari database
    const user = await User.findById(userId);
    if (!user || !user.password) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan atau password tidak tersedia',
      });
    }

    // Verifikasi current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Password saat ini tidak benar',
      });
    }

    // Hash password baru
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password di database
    await User.update(userId, { password: hashedNewPassword });

    res.json({
      success: true,
      message: 'Password berhasil diubah',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
    });
  }
};
