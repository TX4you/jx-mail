import express from 'express';
import stalwartService from '../services/stalwart.service.js';
import authenticate from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

// Status
router.get('/status', async (req, res) => {
  try {
    const status = await stalwartService.getSystemStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await stalwartService.getLogs();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Queue
router.get('/queue', async (req, res) => {
  try {
    const queue = await stalwartService.getQueue();
    res.json(queue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/queue/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await stalwartService.deleteQueueItem(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Antispam
router.get('/antispam', async (req, res) => {
  try {
    const config = await stalwartService.getAntispam();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/antispam', async (req, res) => {
  const { spamScore, enableGreylist } = req.body;
  try {
    const result = await stalwartService.updateAntispam({ spamScore, enableGreylist });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/antispam/allowlist', async (req, res) => {
  const { item } = req.body;
  if (!item) return res.status(400).json({ error: 'Item é obrigatório.' });
  try {
    const result = await stalwartService.addAllowlistItem(item);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/antispam/allowlist/:item', async (req, res) => {
  const { item } = req.params;
  try {
    const result = await stalwartService.removeAllowlistItem(item);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/antispam/blocklist', async (req, res) => {
  const { item } = req.body;
  if (!item) return res.status(400).json({ error: 'Item é obrigatório.' });
  try {
    const result = await stalwartService.addBlocklistItem(item);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/antispam/blocklist/:item', async (req, res) => {
  const { item } = req.params;
  try {
    const result = await stalwartService.removeBlocklistItem(item);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
