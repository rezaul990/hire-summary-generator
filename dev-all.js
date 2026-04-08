const { spawn } = require('child_process');

console.log('🚀 Starting both applications...\n');

// Start main app on port 3000
console.log('📊 Starting Collection Summary App on http://localhost:3000');
const mainApp = spawn('npm', ['start'], {
  stdio: 'inherit',
  shell: true
});

// Start person-id-report on port 5173 (Vite default)
console.log('👤 Starting Person ID Report on http://localhost:5173\n');
const personIdApp = spawn('npm', ['run', 'dev'], {
  cwd: './person-id-report',
  stdio: 'inherit',
  shell: true
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping all applications...');
  mainApp.kill();
  personIdApp.kill();
  process.exit();
});

mainApp.on('error', (error) => {
  console.error('❌ Failed to start main app:', error);
});

personIdApp.on('error', (error) => {
  console.error('❌ Failed to start Person ID Report:', error);
});
