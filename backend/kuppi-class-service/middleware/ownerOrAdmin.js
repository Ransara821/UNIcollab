const KuppiClass = require('../models/KuppiClass');

exports.ownerOrAdmin = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') return next();

    const session = await KuppiClass.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found.' });

    if (session.postedById !== req.user.id) {
      return res.status(403).json({ message: 'You can only manage your own sessions.' });
    }

    req.kuppiClass = session;   // attach so controller can reuse without a second query
    next();
  } catch (err) {
    res.status(500).json({ message: 'Ownership check failed.', error: err.message });
  }
};
