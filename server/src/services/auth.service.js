import jwt from 'jsonwebtoken';
import { JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD } from '../config/env.js';

class AuthService {
  async login(email, password) {
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      throw new Error('Credenciais inválidas.');
    }

    const token = jwt.sign(
      {
        id: 'admin',
        email: ADMIN_EMAIL,
        name: 'Administrador Local'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: 'admin',
        email: ADMIN_EMAIL,
        name: 'Administrador Local'
      }
    };
  }
}

export default new AuthService();
