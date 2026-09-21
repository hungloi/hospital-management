#!/usr/bin/env node
const { exec } = require('child_process');
const path = require('path');

// Run seed using npx
exec('npx tsx prisma/seed.ts', {
  cwd: path.join(__dirname),
  stdio: 'inherit',
  shell: true
}, (error, stdout, stderr) => {
  if (error) {
    console.error('Error running seed:', error);
    process.exit(1);
  }
  console.log(stdout);
  if (stderr) console.error(stderr);
});
