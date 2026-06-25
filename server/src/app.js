import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.routes.js';
import domainsRoutes from './routes/domains.routes.js';
import accountsRoutes from './routes/accounts.routes.js';
import aliasesRoutes from './routes/aliases.routes.js';
import systemRoutes from './routes/system.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/domains', domainsRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/aliases', aliasesRoutes);
app.use('/api/system', systemRoutes);

// Static files for frontend build
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Fallback to index.html for React router
app.get('*', (req, res) => {
  // If request wants JSON (e.g. broken API endpoint), don't send index.html
  if (req.accepts('html')) {
    res.sendFile(path.join(publicPath, 'index.html'), (err) => {
      if (err) {
        res.status(404).send('Not Found');
      }
    });
  } else {
    res.status(404).json({ error: 'Recurso não encontrado' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[App Error]:', err);
  res.status(500).json({ error: err.message || 'Erro interno no servidor.' });
});

export default app;
