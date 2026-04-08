const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

console.log('🚀 Building Collection Summary App...');

// Build main app
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Main app built successfully');
} catch (error) {
  console.error('❌ Failed to build main app');
  process.exit(1);
}

// Build person-id-report
console.log('\n🚀 Building Person ID Report...');
try {
  execSync('cd person-id-report && npm install && npm run build', { stdio: 'inherit' });
  console.log('✅ Person ID Report built successfully');
} catch (error) {
  console.error('❌ Failed to build Person ID Report');
  process.exit(1);
}

// Copy person-id-report build to main build folder
console.log('\n📦 Copying Person ID Report to main build...');
try {
  const personIdBuildPath = path.join(__dirname, 'person-id-report', 'dist');
  const mainBuildPath = path.join(__dirname, 'build', 'person-id-report');
  
  // Ensure the destination directory exists
  fs.ensureDirSync(mainBuildPath);
  
  // Copy the built files
  fs.copySync(personIdBuildPath, mainBuildPath);
  
  console.log('✅ Person ID Report copied successfully');
  console.log('\n🎉 All builds completed successfully!');
  console.log('\n📁 Build output:');
  console.log('   - Main app: ./build/');
  console.log('   - Person ID Report: ./build/person-id-report/');
} catch (error) {
  console.error('❌ Failed to copy Person ID Report:', error.message);
  process.exit(1);
}
