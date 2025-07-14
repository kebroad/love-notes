import * as bcrypt from 'bcrypt';

// Production user data
const productionUsers = {
  kevin: {
    password: "password123",
  },
  nicole: {
    password: "password123",
  }
};

const generatePasswordHashes = async () => {
  console.log('🔐 Generating password hashes for production users...');
  console.log('');
  
  const saltRounds = 10;

  for (const [username, userData] of Object.entries(productionUsers)) {
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    
    console.log(`👤 User: ${username}`);
    console.log(`📝 Document ID: ${username}`);
    console.log(`🔑 Hashed Password: ${hashedPassword}`);
    console.log('');
    console.log('📋 Firestore Document Structure:');
    console.log(JSON.stringify({
      username: username,
      password: hashedPassword,
      images: [],
      latest: 0
    }, null, 2));
    console.log('');
    console.log('─'.repeat(60));
    console.log('');
  }

  console.log('🎯 Instructions:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com/project/love-notes-kb-2025/firestore');
  console.log('2. Navigate to Firestore Database');
  console.log('3. Create a collection called "users"');
  console.log('4. For each user above, create a document with the Document ID and JSON structure shown');
  console.log('');
  console.log('🌐 After adding users, test at: https://love-notes-kb-2025.web.app');
  console.log('   - Username: kevin, Password: password123');
  console.log('   - Username: nicole, Password: password123');
};

const main = async () => {
  try {
    await generatePasswordHashes();
    console.log('✨ Password generation completed successfully!');
  } catch (error) {
    console.error('❌ Password generation failed:', error);
    process.exit(1);
  }
};

main(); 