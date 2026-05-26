import fs from 'fs';
import path from 'path';

// Define paths
const rootDir = path.resolve('..');
const sampleDemoPath = path.join(rootDir, 'sample_demo.mp4');
const uploadsDir = path.resolve('uploads');

const missingFiles = [
  'fadb317d-4776-4861-8539-1103de3c81c5.mp4',
  '64ae6169-ee80-439e-a1f2-1b2c0421e205.mp4',
  'a53f6fa2-ad06-4889-82a3-bb858add19b2.mp4',
  'e8dc0936-1a74-4f25-b9fe-d9df74842aa4.mp4'
];

const fix = () => {
  if (!fs.existsSync(sampleDemoPath)) {
    console.error(`Error: sample_demo.mp4 not found at ${sampleDemoPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  console.log(`Copying sample_demo.mp4 to missing uploads paths...`);
  
  for (const filename of missingFiles) {
    const dest = path.join(uploadsDir, filename);
    try {
      fs.copyFileSync(sampleDemoPath, dest);
      console.log(`✅ Copied to ${filename}`);
    } catch (err) {
      console.error(`❌ Failed to copy to ${filename}:`, err.message);
    }
  }

  console.log('\nAll missing video files restored! Reload your dashboards and try playing them.');
};

fix();
