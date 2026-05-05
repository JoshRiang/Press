import db from '../config/db.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await db('users').where({ id: req.user_id }).first();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profileData = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      created_at: user.created_at,
      metrics: {
        currentWeight: user.current_weight ? parseFloat(user.current_weight) : 60,
        targetWeight: user.target_weight ? parseFloat(user.target_weight) : 65,
        height: user.height ? parseFloat(user.height) : 170,
        weightHistory: user.weight_history || [],
        unit: 'kg'
      },
      settings: {
        weightIncrement: user.weight_increment != null ? parseFloat(user.weight_increment) : 2.5,
        repThreshold: user.rep_threshold != null ? parseInt(user.rep_threshold, 10) : 10,
        volumeOverload: user.volume_overload != null ? parseFloat(user.volume_overload) : 5.0,
      }
    };

    res.json(profileData);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { metrics, settings } = req.body;
    
    if (!metrics && !settings) {
      return res.status(400).json({ message: 'Metrics or settings object is required' });
    }

    const updates = {};
    if (metrics) {
      if (metrics.currentWeight !== undefined) updates.current_weight = metrics.currentWeight;
      if (metrics.targetWeight !== undefined) updates.target_weight = metrics.targetWeight;
      if (metrics.height !== undefined) updates.height = metrics.height;
      if (metrics.weightHistory !== undefined) updates.weight_history = JSON.stringify(metrics.weightHistory);
    }

    if (settings) {
      if (settings.weightIncrement !== undefined) updates.weight_increment = settings.weightIncrement;
      if (settings.repThreshold !== undefined) updates.rep_threshold = settings.repThreshold;
      if (settings.volumeOverload !== undefined) updates.volume_overload = settings.volumeOverload;
    }

    if (Object.keys(updates).length > 0) {
      await db('users').where({ id: req.user_id }).update(updates);
    }

    const updatedUser = await db('users').where({ id: req.user_id }).first();
    
    const profileData = {
      id: updatedUser.id,
      email: updatedUser.email,
      full_name: updatedUser.full_name,
      created_at: updatedUser.created_at,
      metrics: {
        currentWeight: updatedUser.current_weight ? parseFloat(updatedUser.current_weight) : 60,
        targetWeight: updatedUser.target_weight ? parseFloat(updatedUser.target_weight) : 65,
        height: updatedUser.height ? parseFloat(updatedUser.height) : 170,
        weightHistory: updatedUser.weight_history || [],
        unit: 'kg'
      },
      settings: {
        weightIncrement: updatedUser.weight_increment != null ? parseFloat(updatedUser.weight_increment) : 2.5,
        repThreshold: updatedUser.rep_threshold != null ? parseInt(updatedUser.rep_threshold, 10) : 10,
        volumeOverload: updatedUser.volume_overload != null ? parseFloat(updatedUser.volume_overload) : 5.0,
      }
    };

    res.json(profileData);
  } catch (err) {
    next(err);
  }
};
