const RecognitionApplication = require('../models/RecognitionApplication');
const StudentProfile         = require('../models/StudentProfile');

// POST /api/kuppi-class/recognition/apply  (protect)
// Submits the recognition form
exports.applyForRecognition = async (req, res) => {
  try {
    const { name, year, specialization, qualification } = req.body;

    if (!name || !year || !specialization || !qualification) {
      return res.status(400).json({ message: 'All fields (name, year, specialization, qualification) are required.' });
    }

    // Check for existing application
    const existing = await RecognitionApplication.findOne({
      studentId: req.user.id
    });

    if (existing) {
      return res.status(409).json({ message: 'You already have a recognition application. Please edit your existing one.' });
    }

    // Create new application
    const application = await RecognitionApplication.create({
      studentId: req.user.id,
      name,
      year,
      specialization,
      qualification,
      status: 'pending'
    });

    // Grant recognition
    await StudentProfile.findOneAndUpdate(
      { userId: req.user.id },
      { recognitionStatus: 'recognized' },
      { upsert: true, new: true }
    );

    res.status(201).json({
      message: 'Application submitted successfully!',
      application,
    });
  } catch (err) {
    console.error('❌ Recognition apply error:', err);
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
    const application = await RecognitionApplication.findOne({
      studentId: req.user.id
    }).sort({ createdAt: -1 });
    res.json(application || null);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your application.', error: err.message });
  }
};

// PUT /api/kuppi-class/recognition/mine  (protect)
// Updates the current user's active recognition application
exports.updateMyApplication = async (req, res) => {
  try {
    const { name, year, specialization, qualification } = req.body;

    if (!name || !year || !specialization || !qualification) {
      return res.status(400).json({ message: 'All fields (name, year, specialization, qualification) are required.' });
    }

    // Find active application
    const application = await RecognitionApplication.findOne({
      studentId: req.user.id
    });

    if (!application) {
      return res.status(404).json({ message: 'You have not submitted a recognition application yet.' });
    }

    // Update application
    application.name = name;
    application.year = year;
    application.specialization = specialization;
    application.qualification = qualification;
    await application.save();

    res.json({
      message: 'Application updated successfully.',
      application,
    });
  } catch (err) {
    console.error('❌ Recognition update error:', err);
    res.status(500).json({ message: 'Failed to update application.', error: err.message });
  }
};
