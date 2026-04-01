const RecognitionApplication = require('../models/RecognitionApplication');
const StudentProfile         = require('../models/StudentProfile');

// POST /api/kuppi-class/recognition/apply  (protect)
// Submits the recognition form and immediately grants recognized status.
exports.applyForRecognition = async (req, res) => {
  try {
    const { name, year, specialization, qualification } = req.body;

    if (!name || !year || !specialization || !qualification) {
      return res.status(400).json({ message: 'All fields (name, year, specialization, qualification) are required.' });
    }

    // Prevent duplicate applications
    const existing = await RecognitionApplication.findOne({ studentId: req.user.id });
    if (existing) {
      return res.status(409).json({ message: 'You have already submitted a recognition application.' });
    }

    // Persist the application
    const application = await RecognitionApplication.create({
      studentId: req.user.id,
      name,
      year,
      specialization,
      qualification,
    });

    // Immediately grant recognition — no waiting, no thresholds
    await StudentProfile.findOneAndUpdate(
      { userId: req.user.id },
      { recognitionStatus: 'recognized' },
      { upsert: true, new: true }
    );

    res.status(201).json({
      message: 'Recognition granted! You can now create Kuppi sessions.',
      application,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'You have already submitted a recognition application.' });
    }
    res.status(500).json({ message: 'Failed to submit application.', error: err.message });
  }
};

// GET /api/kuppi-class/recognition/all  (public)
// Returns all approved tutors — used to render the Recognition directory.
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await RecognitionApplication.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch applications.', error: err.message });
  }
};

// GET /api/kuppi-class/recognition/mine  (protect)
// Returns the current user's own application (null if not yet applied).
exports.getMyApplication = async (req, res) => {
  try {
    const application = await RecognitionApplication.findOne({ studentId: req.user.id });
    res.json(application || null);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your application.', error: err.message });
  }
};

// PUT /api/kuppi-class/recognition/mine  (protect)
// Updates the current user's recognition application details.
exports.updateMyApplication = async (req, res) => {
  try {
    const { name, year, specialization, qualification } = req.body;

    if (!name || !year || !specialization || !qualification) {
      return res.status(400).json({ message: 'All fields (name, year, specialization, qualification) are required.' });
    }

    const application = await RecognitionApplication.findOneAndUpdate(
      { studentId: req.user.id },
      { name, year, specialization, qualification },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: 'You have not submitted a recognition application yet.' });
    }

    res.json({
      message: 'Application updated successfully.',
      application,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update application.', error: err.message });
  }
};
