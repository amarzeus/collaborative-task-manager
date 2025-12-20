#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function addExtensionsToImports(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;

    // Match relative imports without extensions
    const importRegex = /from\s+['"](\.\.[^^'"\s]+|\.\/[^'"\s]+)['"]/g;

    content = content.replace(importRegex, (match, importPath) => {
        //Skip if already has an extension
        if (/\.(tsx?|jsx?|json)$/.test(importPath)) {
            return match;
        }

        // Determine extension based on file structure
        const importingFrom = filePath.replace(process.cwd() + '/src/', '');
        const importDir = path.dirname(filePath);
        const targetPath = path.join(importDir, importPath);

        // Check if .tsx or .ts file exists
        if (fs.existsSync(targetPath + '.tsx')) {
            modified = true;
            return match.replace(importPath, importPath + '.tsx');
        } else if (fs.existsSync(targetPath + '.ts')) {
            modified = true;
            return match.replace(importPath, importPath + '.ts');
        }

        return match;
    });

    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`✓ Updated: ${filePath}`);
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            processDirectory(filePath);
        } else if (/\.(tsx?|jsx?)$/.test(file)) {
            addExtensionsToImports(filePath);
        }
    }
}

console.log('Adding .ts/.tsx extensions to imports...');
processDirectory(path.join(__dirname, 'src'));
console.log('Done!');
