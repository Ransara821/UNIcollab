const KuppiClass = require('../models/KuppiClass');
const { SUBJECTS, ACADEMIC_YEARS, SESSION_STATUSES } = require('../constants/filterOptions');

// GET /api/kuppi-class/filters
const getFilterOptions = (_req, res) => {
  res.json({ subjects: SUBJECTS, academicYears: ACADEMIC_YEARS, statuses: SESSION_STATUSES });
};

// GET /api/kuppi-class?subject=&academicYear=&status=
const getAllKuppiClasses = async (req, res) => {
  try {
    const { subject, academicYear, status } = req.query;
    const query = {};

    if (subject)      query.subject      = subject;
    if (academicYear) query.academicYear = academicYear;

    if (status === 'upcoming')  query.sessionDate = { $gte: new Date() };
    if (status === 'completed') query.sessionDate = { $lt:  new Date() };

    const kuppiClasses = await KuppiClass.find(query).sort({ sessionDate: 1 });
    res.status(200).json(kuppiClasses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch Kuppi classes', error: error.message });
  }
};

// GET /api/kuppi-class/my-sessions  (requires protect)
const getMySessions = async (req, res) => {
  try {
    const sessions = await KuppiClass.find({ postedById: req.user.id }).sort({ sessionDate: -1 });
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your sessions.', error: error.message });
  }
};

// GET /api/kuppi-class/:id
const getKuppiClassById = async (req, res) => {
  try {
    const kuppiClass = await KuppiClass.findById(req.params.id);
    if (!kuppiClass) return res.status(404).json({ message: 'Kuppi class not found' });
    res.status(200).json(kuppiClass);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch Kuppi class', error: error.message });
  }
};

// POST /api/kuppi-class  (protect + recognizedOnly)
const createKuppiClass = async (req, res) => {
  try {
    const { title, subject, academicYear, description, location, sessionDate, postedBy, capacity } = req.body;

    if (!title || !subject || !academicYear || !sessionDate) {
      return res.status(400).json({ message: 'title, subject, academicYear, and sessionDate are required.' });
    }

    const kuppiClass = await KuppiClass.create({
      title,
      subject,
      academicYear,
      description,
      location,
      sessionDate,
      postedBy,
      postedById: req.user.id,
      capacity:   capacity ? Number(capacity) : 20,
    });

    res.status(201).json(kuppiClass);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create Kuppi class', error: error.message });
  }
};

// PUT /api/kuppi-class/:id  (protect + ownerOrAdmin)
const EDITABLE_FIELDS = ['title', 'subject', 'academicYear', 'description', 'location', 'sessionDate', 'postedBy', 'capacity'];

const updateKuppiClass = async (req, res) => {
  try {
    const updates = {};
    EDITABLE_FIELDS.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const updated = await KuppiClass.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Kuppi class not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update Kuppi class', error: error.message });
  }
};

// DELETE /api/kuppi-class/:id  (protect + ownerOrAdmin)
const deleteKuppiClass = async (req, res) => {
  try {
    const deleted = await KuppiClass.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Kuppi class not found' });
    res.status(200).json({ message: 'Kuppi class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete Kuppi class', error: error.message });
  }
};

module.exports = {
  getFilterOptions,
  getAllKuppiClasses,
  getMySessions,
  getKuppiClassById,
  createKuppiClass,
  updateKuppiClass,
  deleteKuppiClass,
};
