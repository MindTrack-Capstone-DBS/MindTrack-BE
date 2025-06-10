const express = require('express');
const journalController = require('../controllers/journal.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Semua routes memerlukan autentikasi
router.use(authMiddleware);

// Endpoint untuk jurnal
router.post('/', journalController.createJournal);
router.get('/', journalController.getJournals);
router.get('/stats', journalController.getMoodStats);
router.get('/:id', journalController.getJournalById);
router.put('/:id', journalController.updateJournal);
router.delete('/:id', journalController.deleteJournal);

module.exports = router;