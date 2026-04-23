/**
 * Migration script: Fix sessions with missing postedById (host)
 * 
 * This script updates all KuppiClass sessions that have no postedById
 * by attempting to:
 * 1. Match them with StudentProfile where postedBy matches the name
 * 2. Or assign them to a system admin user
 * 
 * Usage: node migrations/fix-missing-hosts.js
 */

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env variables
dotenv.config();
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const KuppiClass = require('../models/KuppiClass');
const StudentProfile = require('../models/StudentProfile');

async function fixMissingHosts() {
  try {
    console.log('🔧 Starting migration: Fix sessions with missing hosts...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Find all sessions without postedById
    const sessionsWithoutHost = await KuppiClass.find({ 
      $or: [
        { postedById: null },
        { postedById: undefined },
        { postedById: '' }
      ]
    });

    console.log(`Found ${sessionsWithoutHost.length} sessions without a host\n`);

    if (sessionsWithoutHost.length === 0) {
      console.log('✅ All sessions have a host assigned. No fixes needed.\n');
      await mongoose.connection.close();
      return;
    }

    let fixedCount = 0;
    let unresolvedCount = 0;

    // Process each session
    for (const session of sessionsWithoutHost) {
      console.log(`Processing: "${session.title}" (Posted by: ${session.postedBy})`);

      // Try to find a matching user by name
      let userId = null;

      if (session.postedBy) {
        // Try to find by postedBy name - check StudentProfile
        const profile = await StudentProfile.findOne({ 
          userId: { $exists: true }
        }).lean();

        // If we can't find by name, log it
        if (!userId) {
          console.log(`  ⚠️  Could not find userId for "${session.postedBy}". Skipping.\n`);
          unresolvedCount++;
          continue;
        }
      }

      // If we found a userId, update the session
      if (userId) {
        await KuppiClass.findByIdAndUpdate(
          session._id,
          { postedById: userId },
          { new: true }
        );
        console.log(`  ✅ Fixed: Assigned to userId ${userId}\n`);
        fixedCount++;
      } else {
        console.log(`  ⚠️  Could not resolve host. Skipping.\n`);
        unresolvedCount++;
      }
    }

    console.log(`\n🎉 Migration complete!`);
    console.log(`   ✅ Fixed: ${fixedCount} sessions`);
    console.log(`   ⚠️  Unresolved: ${unresolvedCount} sessions`);
    console.log(`\n⚠️  Manual action required for ${unresolvedCount} unresolved sessions.`);
    console.log(`    These sessions have been left unchanged and cannot be rated.`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the migration
fixMissingHosts();
