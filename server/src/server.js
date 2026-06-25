import app from './app.js';
import { PORT } from './config/env.js';

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`[jx-mail-panel] Admin server running on port ${PORT}`);
  console.log(`====================================================`);
});
