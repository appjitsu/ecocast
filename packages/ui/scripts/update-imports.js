const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../src/components/shadcn');

// Read all component files
const files = fs
  .readdirSync(componentsDir)
  .filter((file) => file.endsWith('.tsx'));

// Update imports in each file
files.forEach((file) => {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Update relative imports to use @ alias
  content = content.replace(
    /import\s*{\s*cn\s*}\s*from\s*['"](?:\.\.\/)*lib\/utils['"]/g,
    'import { cn } from "@/lib/utils"',
  );

  // Update other relative imports
  content = content.replace(
    /import\s*{\s*useToast\s*}\s*from\s*['"]@\/components\/hooks\/use-toast['"]/g,
    'import { useToast } from "@/hooks/use-toast"',
  );

  fs.writeFileSync(filePath, content);
});

console.log('Updated imports in all component files');
