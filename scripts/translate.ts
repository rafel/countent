import fs from 'fs';
import path from 'path';
import * as globModule from 'glob';

// Define language files paths
const LANGUAGE_FILES = {
  en: path.resolve(__dirname, '../content/en/index.ts'),
  sv: path.resolve(__dirname, '../content/sv/index.ts'),
};

// Function to extract translation keys from files
async function extractTranslationKeys() {
  // Use the glob promise API
  const files = await globModule.glob('app/**/*.{ts,tsx}', { ignore: ['app/content/**/*'] });
  
  // Enhanced regex to capture more patterns including template literals
  const translationKeyRegex = /ttt\(['"]([^'"]+)['"](?:\)|,)|ttt\(`([^`]+)`(?:\)|,)|`[^`]*\$\{ttt\(['"]([^'"]+)['"]\)[^`]*`/g;
  
  const keys = new Set<string>();

  files.forEach((file: string) => {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    
    while ((match = translationKeyRegex.exec(content)) !== null) {
      // The key could be in any of the capture groups
      const key = match[1] || match[2] || match[3];
      if (key) {
        keys.add(key);
      }
    }
  });

  return Array.from(keys);
}

// Function to parse existing translations directly from the file
function parseTranslations(filePath: string): Record<string, string> {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const result: Record<string, string> = {};
    
    // Use regex to find all key-value pairs
    const keyValueRegex = /'([^']+)':\s*'([^']*)'/g;
    let match;
    
    while ((match = keyValueRegex.exec(content)) !== null) {
      const key = match[1];
      const value = match[2];
      result[key] = value;
    }
    
    return result;
  } catch (e) {
    console.error(`Error reading file ${filePath}:`, e);
    return {};
  }
}

// Function to update translation files
function updateTranslationFiles(keys: string[]) {
  // First, get all translations from English file
  const enTranslations = parseTranslations(LANGUAGE_FILES.en);
  const enKeys = Object.keys(enTranslations);
  
  // Combine keys from code and English file
  const allKeys = [...new Set([...keys, ...enKeys])];
  
  // Process each language file
  Object.entries(LANGUAGE_FILES).forEach(([lang, filePath]) => {
    const existingTranslations = parseTranslations(filePath);
    const newKeys: string[] = [];
    
    // Find keys that don't exist in the current translations
    allKeys.forEach(key => {
      if (existingTranslations[key] === undefined) {
        newKeys.push(key);
      }
    });
    
    if (newKeys.length > 0) {
      // Read the current file content
      let fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Find the position to insert new translations (before the closing brace)
      const closingBracePos = fileContent.lastIndexOf('}');
      
      if (closingBracePos !== -1) {
        // Format new translations
        const newTranslationsStr = newKeys
          .map(key => {
            if (lang === 'en') {
              return `  '${key}': '${key}'`;
            } else if (lang === 'sv') {
              return `  '${key}': ''`;
            }
            return '';
          })
          .join(',\n');
        
        // Check if there's content before the closing brace
        const contentBeforeBrace = fileContent.substring(0, closingBracePos).trim();
        const needsComma = contentBeforeBrace.length > 0 && 
                          !contentBeforeBrace.endsWith(',') && 
                          !contentBeforeBrace.endsWith('{');
        
        // Insert new translations with appropriate comma
        const insertStr = needsComma ? `,\n${newTranslationsStr}` : `\n${newTranslationsStr}`;
        
        fileContent = 
          fileContent.substring(0, closingBracePos).trimEnd() + 
          insertStr + 
          fileContent.substring(closingBracePos);
        
        fs.writeFileSync(filePath, fileContent, 'utf8');
        console.log(`Updated ${lang} translations file with ${newKeys.length} new keys`);
      } else {
        console.error(`Could not find closing brace in ${filePath}`);
      }
    } else {
      console.log(`No updates needed for ${lang} translations`);
    }
  });
}

// Main function
async function main() {
  console.log('Extracting translation keys from codebase...');
  const keys = await extractTranslationKeys();
  console.log(`Found ${keys.length} translation keys from code`);
  
  console.log('Updating translation files...');
  updateTranslationFiles(keys);
  
  console.log('Done!');
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 
