import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packagePath = path.resolve(__dirname, '../package.json');

try {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const version = packageJson.version;
  const parts = version.split('.');
  
  if (parts.length === 3) {
    // Increment patch version
    parts[2] = parseInt(parts[2], 10) + 1;
    packageJson.version = parts.join('.');
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`Version incremented: ${version} -> ${packageJson.version}`);
  } else {
    console.error('Invalid version format in package.json');
  }
} catch (error) {
  console.error('Error incrementing version:', error.message);
  process.exit(1);
}
