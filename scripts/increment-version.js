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
  
  if (parts.length >= 2) {
    // Generate timestamp in YYYYMMDD-HHmmss format (KST / GMT+9)
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const f = formatter.formatToParts(now);
    const get = (type) => f.find(p => p.type === type).value;
    const timestamp = `${get('year')}${get('month')}${get('day')}-${get('hour')}${get('minute')}${get('second')}`;
    
    // Set patch or third segment to timestamp
    const newVersion = `${parts[0]}.${parts[1]}.${timestamp}`;
    packageJson.version = newVersion;
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`Version updated: ${version} -> ${newVersion}`);

    // Also write to public/version.json for client-side polling
    const versionPath = path.resolve(__dirname, '../public/version.json');
    fs.writeFileSync(versionPath, JSON.stringify({ version: newVersion }, null, 2) + '\n');
    console.log(`Generated public/version.json: ${newVersion}`);
  } else {
    console.error('Invalid version format in package.json');
  }
} catch (error) {
  console.error('Error updating version:', error.message);
  process.exit(1);
}
