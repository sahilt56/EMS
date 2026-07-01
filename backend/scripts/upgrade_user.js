const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');

const email = process.argv[2];

if (!email) {
  console.error('\n❌ Error: Please provide an email address.\nExample: node scripts/upgrade_user.js test@example.com\n');
  process.exit(1);
}

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('\n❌ Error: MONGODB_URI is not defined in backend/.env\n');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(async () => {
    const updatedUser = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { role: 'Admin' },
      { new: true }
    );

    if (!updatedUser) {
      console.error(`\n❌ Error: User with email "${email}" not found in MongoDB. please sign up/register on the frontend first.\n`);
    } else {
      console.log(`\n🎉 Success! User "${email}" has been upgraded to role: "${updatedUser.role}" in MongoDB.\n`);
    }
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error('\n❌ Connection Error:', err.message, '\n');
    process.exit(1);
  });
