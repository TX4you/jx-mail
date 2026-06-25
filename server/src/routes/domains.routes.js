import express from 'express';
import stalwartService from '../services/stalwart.service.js';
import authenticate from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const list = await stalwartService.getDomains();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Nome do domínio é obrigatório.' });
  }
  try {
    const result = await stalwartService.createDomain(name, description);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const result = await stalwartService.deleteDomain(name);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
