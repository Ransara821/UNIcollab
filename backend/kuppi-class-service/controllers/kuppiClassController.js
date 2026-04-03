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
    const errors = {};

    // Validate title
    if (!title || !title.trim()) {
      errors.title = 'Title is required';
    }

    // Validate subject
    if (!subject || !subject.trim()) {
      errors.subject = 'Subject is required';
    } else if (!SUBJECTS.includes(subject)) {
      errors.subject = 'Invalid subject selected';
    }

    // Validate academicYear
    if (!academicYear || !academicYear.trim()) {
      errors.academicYear = 'Academic Year is required';
    } else if (!ACADEMIC_YEARS.includes(academicYear)) {
      errors.academicYear = 'Invalid academic year selected';
    }

    // Validate location
    if (!location || !location.trim()) {
      errors.location = 'Location is required';
    }

    // Validate postedBy (your name)
    if (!postedBy || !postedBy.trim()) {
      errors.postedBy = 'Your Name is required';
    }

    // Validate description
    if (!description || !description.trim()) {
      errors.description = 'Description is required';
    } else if (description.trim().length <= 10) {
      errors.description = 'Description must be more than 10 characters';
    }

    // Validate sessionDate
    if (!sessionDate) {
      errors.sessionDate = 'Date & Time is required';
    } else {
      const selectedDate = new Date(sessionDate);
      const now = new Date();
      
      if (isNaN(selectedDate.getTime())) {
        errors.sessionDate = 'Invalid date format';
      } else if (selectedDate < now) {
        errors.sessionDate = 'Date cannot be in the past';
      }
    }

    // Validate capacity
    if (!capacity) {
      errors.capacity = 'Capacity is required';
    } else {
      const capacityNum = Number(capacity);
      if (isNaN(capacityNum) || capacityNum < 1 || capacityNum > 200) {
        errors.capacity = 'Capacity must be a number between 1 and 200';
      }
    }

    // Return validation errors if any
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
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
      capacity: Number(capacity),
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
