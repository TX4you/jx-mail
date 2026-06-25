import express from 'express';
import stalwartService from '../services/stalwart.service.js';
import authenticate from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const list = await stalwartService.getAccounts();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { username, domain, password, quota } = req.body;
  if (!username || !domain || !password) {
    return res.status(400).json({ error: 'Campos username, domain e password são obrigatórios.' });
  }
  try {
    const result = await stalwartService.createAccount(username, domain, password, quota);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:email', async (req, res) => {
  const { email } = req.params;
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'E-mail inválido.' });
  }
  const username = email.split('@')[0];
  const domain = email.split('@')[1];
  try {
    const result = await stalwartService.deleteAccount(username, domain);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:email/status', async (req, res) => {
  const { email } = req.params;
  const { active } = req.body;
  if (active === undefined) {
    return res.status(400).json({ error: 'Status active é obrigatório.' });
  }
  try {
    const result = await stalwartService.updateAccountStatus(email, active);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
