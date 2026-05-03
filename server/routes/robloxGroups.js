import express from 'express';
import fetch from 'node-fetch';
import { getDB } from '../database.js';

const router = express.Router();

/**
 * Verifica si un usuario está en un grupo específico
 */
const isUserInGroup = async (userId, groupId) => {
  try {
    const response = await fetch(
      `https://groups.roblox.com/v1/users/${userId}/groups/roles`
    );
    
    if (!response.ok) {
      console.error(`Error verificando grupo ${groupId} para usuario ${userId}`);
      return false;
    }
    
    const data = await response.json();
    const groups = data.data || [];
    
    return groups.some(g => g.group.id === parseInt(groupId));
  } catch (error) {
    console.error(`Error en verificación de grupo:`, error);
    return false;
  }
};

/**
 * Obtiene los grupos requeridos configurados por el administrador
 */
router.get('/config', async (req, res) => {
  try {
    const db = getDB('settings');
    await db.read();
    
    res.json({
      success: true,
      data: db.data.requiredGroups || []
    });
  } catch (error) {
    console.error('Error al obtener configuración de grupos:', error);
    res.status(500).json({ success: false, error: 'Error al obtener configuración' });
  }
});

/**
 * Actualiza la configuración de grupos (solo admin)
 */
router.post('/config', async (req, res) => {
  try {
    const { groups } = req.body;
    const db = getDB('settings');
    await db.read();
    
    db.data.requiredGroups = groups;
    await db.write();
    
    res.json({
      success: true,
      message: 'Configuración actualizada correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar configuración de grupos:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar configuración' });
  }
});

/**
 * Verifica la membresía de un usuario en todos los grupos requeridos
 */
router.get('/check/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDB('settings');
    await db.read();
    
    const requiredGroups = db.data.requiredGroups || [];
    
    if (requiredGroups.length === 0) {
      return res.json({
        success: true,
        data: {
          allJoined: true,
          joinedCount: 0,
          totalRequired: 0,
          details: []
        }
      });
    }

    const results = await Promise.all(
      requiredGroups.map(async (group) => {
        const isMember = await isUserInGroup(userId, group.id);
        return {
          groupId: group.id,
          groupName: group.name,
          isMember
        };
      })
    );
    
    const allJoined = results.every(r => r.isMember);
    const joinedCount = results.filter(r => r.isMember).length;
    
    res.json({
      success: true,
      data: {
        allJoined,
        joinedCount,
        totalRequired: requiredGroups.length,
        details: results
      }
    });
    
  } catch (error) {
    console.error('Error verificando grupos:', error);
    res.status(500).json({ success: false, error: 'Error al verificar' });
  }
});

/**
 * Proxy para obtener iconos de grupos (evita CORS)
 */
router.get('/icons', async (req, res) => {
  try {
    const { groupIds } = req.query;
    if (!groupIds) return res.status(400).json({ error: 'groupIds are required' });

    const response = await fetch(
      `https://thumbnails.roblox.com/v1/groups/icons?groupIds=${groupIds}&size=150x150&format=Png&isCircular=false`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error proxying icons:', error);
    res.status(500).json({ error: 'Failed to fetch icons' });
  }
});

export default router;
