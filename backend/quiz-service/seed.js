require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Subject = require('./models/Subject');
const connectDB = require('./config/db');

async function seedData() {
  try {
    await connectDB();
    console.log('🔗 Connected to DB for seeding...');

    await Subject.deleteMany({});
    console.log('🗑️  Cleared existing Subjects');

    const subjects = [
      { name: 'Data Structures', code: 'CS101', year: '1st Year', semester: 'Semester 1', description: 'Intro to basic data structures' },
      { name: 'Algorithms', code: 'CS102', year: '1st Year', semester: 'Semester 2', description: 'Algorithm design and analysis' },
      { name: 'Operating Systems', code: 'CS201', year: '2nd Year', semester: 'Semester 1', description: 'OS Concepts' },
      { name: 'Database Systems', code: 'CS202', year: '2nd Year', semester: 'Semester 2', description: 'SQL and NoSQL DBs' },
      { name: 'Computer Networks', code: 'CS301', year: '3rd Year', semester: 'Semester 1', description: 'Networking principles' },
      { name: 'Software Engineering', code: 'CS302', year: '3rd Year', semester: 'Semester 2', description: 'SDLC and Agile methodologies' },
      { name: 'Artificial Intelligence', code: 'CS401', year: '4th Year', semester: 'Semester 1', description: 'Machine Learning & AI logic' },
      { name: 'Cloud Computing', code: 'CS402', year: '4th Year', semester: 'Semester 2', description: 'AWS, Azure & Cloud Arch' },
    ];

    await Subject.insertMany(subjects);
    console.log('✅ Seeded Subject data successfully!');

    process.exit();
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
}

seedData();
