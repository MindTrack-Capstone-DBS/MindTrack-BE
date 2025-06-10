const Journal = require('../models/journal.model');

exports.createJournal = async (req, res) => {
  try {
    // Validasi input
    if (!req.body.content || !req.body.mood_emoji || !req.body.mood_value) {
      return res.status(400).send({
        message: 'Konten jurnal dan mood harus diisi!',
      });
    }

    // Buat jurnal baru
    const journal = new Journal({
      user_id: req.userId,
      title: req.body.title || '',
      content: req.body.content,
      mood_emoji: req.body.mood_emoji,
      mood_value: parseInt(req.body.mood_value),
    });

    // Simpan jurnal ke database
    const savedJournal = await Journal.create(journal);

    // Kirim respons
    res.status(201).send({
      message: 'Jurnal berhasil disimpan!',
      journal: savedJournal,
    });
  } catch (error) {
    console.error('Error creating journal:', error);
    res.status(500).send({
      message: 'Terjadi kesalahan saat menyimpan jurnal!',
    });
  }
};

exports.getJournals = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const journals = await Journal.findByUserId(req.userId, limit, offset);

    res.status(200).send({
      message: 'Jurnal berhasil diambil!',
      journals: journals,
      pagination: {
        page: page,
        limit: limit,
        total: journals.length // Idealnya ini adalah total count dari database
      }
    });
  } catch (error) {
    console.error('Error getting journals:', error);
    res.status(500).send({
      message: 'Terjadi kesalahan saat mengambil jurnal!',
    });
  }
};

exports.getJournalById = async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id, req.userId);

    if (!journal) {
      return res.status(404).send({
        message: 'Jurnal tidak ditemukan!',
      });
    }

    res.status(200).send({
      message: 'Jurnal berhasil diambil!',
      journal: journal,
    });
  } catch (error) {
    console.error('Error getting journal:', error);
    res.status(500).send({
      message: 'Terjadi kesalahan saat mengambil jurnal!',
    });
  }
};

exports.updateJournal = async (req, res) => {
  try {
    // Validasi input
    if (!req.body.content || !req.body.mood_emoji || !req.body.mood_value) {
      return res.status(400).send({
        message: 'Konten jurnal dan mood harus diisi!',
      });
    }

    const journalData = {
      title: req.body.title || '',
      content: req.body.content,
      mood_emoji: req.body.mood_emoji,
      mood_value: parseInt(req.body.mood_value),
    };

    const updated = await Journal.update(req.params.id, req.userId, journalData);

    if (!updated) {
      return res.status(404).send({
        message: 'Jurnal tidak ditemukan atau tidak ada perubahan!',
      });
    }

    res.status(200).send({
      message: 'Jurnal berhasil diperbarui!',
      journal: { id: req.params.id, ...journalData },
    });
  } catch (error) {
    console.error('Error updating journal:', error);
    res.status(500).send({
      message: 'Terjadi kesalahan saat memperbarui jurnal!',
    });
  }
};

exports.deleteJournal = async (req, res) => {
  try {
    const deleted = await Journal.delete(req.params.id, req.userId);

    if (!deleted) {
      return res.status(404).send({
        message: 'Jurnal tidak ditemukan!',
      });
    }

    res.status(200).send({
      message: 'Jurnal berhasil dihapus!',
    });
  } catch (error) {
    console.error('Error deleting journal:', error);
    res.status(500).send({
      message: 'Terjadi kesalahan saat menghapus jurnal!',
    });
  }
};

exports.getMoodStats = async (req, res) => {
  try {
    const period = req.query.period || 'month'; // 'week' atau 'month'
    const stats = await Journal.getMoodStats(req.userId, period);

    res.status(200).send({
      message: 'Statistik mood berhasil diambil!',
      period: period,
      stats: stats,
    });
  } catch (error) {
    console.error('Error getting mood stats:', error);
    res.status(500).send({
      message: 'Terjadi kesalahan saat mengambil statistik mood!',
    });
  }
};