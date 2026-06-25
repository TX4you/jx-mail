import express from 'express';
import stalwartService from '../services/stalwart.service.js';
import authenticate from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const list = await stalwartService.getAliases();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { alias, target } = req.body;
  if (!alias || !target) {
    return res.status(400).json({ error: 'Campos alias e target são obrigatórios.' });
  }
  try {
    const result = await stalwartService.createAlias(alias, target);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/', async (req, res) => {
  const { alias, target } = req.query;
  if (!alias || !target) {
    return res.status(400).json({ error: 'Campos alias e target são obrigatórios via query parameters.' });
  }
  try {
    const result = await stalwartService.deleteAlias(alias, target);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
