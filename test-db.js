const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

// Legacy URI format to rule out SRV/DNS issues
const uri = "mongodb://unicollab970_db_user:unicollab123@ac-gtozfjp-shard-00-00.cgmi5se.mongodb.net:27017,ac-gtozfjp-shard-00-01.cgmi5se.mongodb.net:27017,ac-gtozfjp-shard-00-02.cgmi5se.mongodb.net:27017/test?ssl=true&replicaSet=atlas-72alhc-shard-0&authSource=admin&retryWrites=true&w=majority";

console.log('Testing connection to legacy nodes...');

mongoose.connect(uri)
  .then(() => {
    console.log('✅ Success! Connected to MongoDB Atlas');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Failed to connect:');
    console.error(err);
    process.exit(1);
  });
