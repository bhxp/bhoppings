import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    const aiDir = path.join(process.cwd(), 'public', 'ai');
    const apps = [];

    const dirs = await fs.readdir(aiDir);
    
    for (const dir of dirs) {
      const appDir = path.join(aiDir, dir);
      const stat = await fs.stat(appDir);
      
      if (stat.isDirectory()) {
        // Check for index.html
        try {
          await fs.access(path.join(appDir, 'index.html'));
          
          // Read package.json if exists for metadata
          let metadata = {};
          try {
            const packageJson = await fs.readFile(
              path.join(appDir, 'package.json'),
              'utf-8'
            );
            metadata = JSON.parse(packageJson);
          } catch (e) {
            // No package.json, use defaults
            metadata = {
              name: dir.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' '),
              description: `AI application: ${dir}`,
              icon: '🤖'
            };
          }

          apps.push({
            name: metadata.name,
            description: metadata.description,
            path: `/public/ai/${dir}/index.html`,
            icon: metadata.icon
          });
        } catch (e) {
          // Skip directories without index.html
          continue;
        }
      }
    }

    res.status(200).json(apps);
  } catch (error) {
    res.status(500).json({ error: 'Failed to scan AI apps directory' });
  }
}
