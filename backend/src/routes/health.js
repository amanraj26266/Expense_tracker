const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ ok: true, service: 'expense-tracker-backend' });
});

module.exports = router;
