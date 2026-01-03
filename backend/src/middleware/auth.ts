import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'siberius-secret-key-change-in-production';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    nome: string;
    authType?: 'full' | 'pin' | 'mobile';
  };
  tecnicoId?: number;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        nome: decoded.nome,
        authType: decoded.authType || 'full'
      };
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erro na autenticação' });
  }
};

// Middleware que exige autenticação completa (não aceita PIN)
export const requireFullAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Autenticação completa necessária' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      if (decoded.authType === 'pin') {
        return res.status(403).json({ 
          error: 'Acesso negado',
          message: 'Esta funcionalidade requer autenticação completa (email e senha)'
        });
      }

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        nome: decoded.nome,
        authType: decoded.authType
      };
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erro na autenticação' });
  }
};

// Middleware opcional - não bloqueia se não houver token
export const optionalAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          nome: decoded.nome
        };
      } catch (err) {
        // Token inválido, mas continua sem usuário
      }
    }
    next();
  } catch (error) {
    next();
  }
};

// Middleware para autenticação mobile (técnicos)
export const mobileAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      if (decoded.authType !== 'mobile') {
        return res.status(403).json({ 
          error: 'Acesso negado',
          message: 'Este endpoint é apenas para aplicativo mobile'
        });
      }

      if (!decoded.tecnicoId) {
        return res.status(403).json({ 
          error: 'Token inválido',
          message: 'Token não contém dados de técnico'
        });
      }

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        nome: decoded.nome,
        authType: decoded.authType
      };
      req.tecnicoId = decoded.tecnicoId;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erro na autenticação' });
  }
};
