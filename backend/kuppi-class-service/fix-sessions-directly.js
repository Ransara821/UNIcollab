#!/usr/bin/env node
/**
 * Quick fix script to assign hosts to sessions without postedById
 * This is a direct database update approach
 * 
 * Usage: node fix-sessions-directly.js <userId>
 * Or: node fix-sessions-directly.js (will use test user ID)
 */

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const KuppiClass = require('./models/KuppiClass');

async function fixSessions() {
  try {
    console.log('🔧 Connecting to MongoDB...\n');

    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI not found in environment variables');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get userId from command line args or use a default
    const providedUserId = process.argv[2];
    
    if (!providedUserId) {
      console.log('⚠️  No userId provided. Listing sessions without hosts:\n');
      
      const sessionsWithoutHost = await KuppiClass.find({
        $or: [
          { postedById: null },
          { postedById: undefined },
          { postedById: '' }
        ]
      }).select('_id title postedBy sessionDate createdAt');

      if (sessionsWithoutHost.length === 0) {
        console.log('✅ No sessions without hosts found!\n');
      } else {
        console.log(`Found ${sessionsWithoutHost.length} sessions without hosts:\n`);
        sessionsWithoutHost.forEach((session, idx) => {
          console.log(`${idx + 1}. "${session.title}"`);
          console.log(`   ID: ${session._id}`);
          console.log(`   Posted by: ${session.postedBy}`);
          console.log(`   Date: ${session.sessionDate}`);
          console.log(`   Created: ${session.createdAt}\n`);
        });
      }

      console.log('\n💡 To fix these sessions, run:');
      console.log('   node fix-sessions-directly.js <userId>\n');
      console.log('Example: node fix-sessions-directly.js 507f1f77bcf86cd799439011\n');
      
      await mongoose.connection.close();
      process.exit(0);
    }

    // User provided a userId - fix the sessions
    console.log(`🔍 Fixing sessions with userId: ${providedUserId}\n`);

    const result = await KuppiClass.updateMany(
      {
        $or: [
          { postedById: null },
          { postedById: undefined },
          { postedById: '' }
        ]
      },
      { $set: { postedById: providedUserId } }
    );

    console.log(`✅ Updated ${result.modifiedCount} sessions\n`);
    console.log(`   Matched: ${result.matchedCount}`);
    console.log(`   Modified: ${result.modifiedCount}\n`);

    if (result.modifiedCount > 0) {
      console.log('🎉 Sessions have been fixed! Students can now rate them.\n');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message, '\n');
    console.error(error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

fixSessions();
