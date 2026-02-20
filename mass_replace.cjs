const fs = require('fs');
const path = require('path');

const directory = './src';
const primaryRegex = /#4f68f8/gi;
const secondaryRegex = /#8b5cf6/gi;
const fileExtensions = ['.tsx', '.ts', '.css'];

function recursiveReplace(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            recursiveReplace(fullPath);
        } else if (fileExtensions.includes(path.extname(fullPath))) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            if (content.match(primaryRegex)) {
                content = content.replace(primaryRegex, 'var(--primary-color)');
                modified = true;
            }
            if (content.match(secondaryRegex)) {
                content = content.replace(secondaryRegex, 'var(--secondary-color)');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

recursiveReplace(directory);
console.log('Done replacing global hex codes.');
