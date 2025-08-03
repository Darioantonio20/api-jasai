import { Request, Response, NextFunction } from 'express';
import { Store } from '../models/Store';

// Extender la interfaz Request para incluir store
declare global {
  namespace Express {
    interface Request {
      store?: any;
    }
  }
}

export const setStore = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const store = await Store.findById(req.params.storeId);
    
    if (!store) {
      res.status(404).json({
        success: false,
        error: 'Tienda no encontrada'
      });
      return;
    }

    req.store = store;
    next();
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};