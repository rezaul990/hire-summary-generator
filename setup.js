const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Collection Summary with Person ID Report...\n');

// Check if person-id-report exists
const personIdPath = path.join(__dirname, 'person-id-report');
if (!fs.existsSync(personIdPath)) {
  console.error('❌ person-id-report folder not found!');
  console.log('Please ensure the person-id-report folder is in the project root.');
  process.exit(1);
}

// Install main app dependencies
console.log('📦 Installing main app dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Main app dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install main app dependencies');
  process.exit(1);
}

// Install person-id-report dependencies
console.log('📦 Installing Person ID Report dependencies...');
try {
  execSync('cd person-id-report && npm install', { stdio: 'inherit', shell: true });
  console.log('✅ Person ID Report dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install Person ID Report dependencies');
  process.exit(1);
}

console.log('🎉 Setup completed successfully!\n');
console.log('📝 Next steps:');
console.log('   - Development: npm run start:all');
console.log('   - Production build: npm run build:all');
console.log('\n📖 See INTEGRATION_GUIDE.md for more details');
