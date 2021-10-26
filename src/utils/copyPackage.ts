import fs from 'fs-extra';
import * as path from 'path';
import globals from './globals';

export default async function copyPackage(packageName: string, onRoot = false) {
  const sourceDirectory = path.resolve(globals.scriptBaseDirectory, 'src', 'packages', packageName, '_default');
  onRoot || await fs.mkdir(path.resolve(globals.workingDirectory, 'src', packageName));
  const targetDirectory = path.resolve(globals.workingDirectory, onRoot ? '' : 'src', onRoot ? '' : packageName);
  
  const fileList = await fs.readdir(sourceDirectory);

  if (!fileList.length) return Promise.resolve();
  
  const copyPromises = fileList.map((fileName) => {
    const sourceFile = path.resolve(sourceDirectory, fileName);
    const targetFile = path.resolve(targetDirectory, fileName);
    
    if (fs.lstatSync(sourceFile).isDirectory()) {
      return fs.mkdir(targetFile); // TODO recursively copy folder structure
    }

    return fs.copyFile(sourceFile, targetFile).then(() => {
      // ? rename after copying to prevent npm from changing .gitignore to .npmignore and ignoring .env
      if (fileName === '.npmignore') {
        return fs.move(
          targetFile,
          path.resolve(targetDirectory, fileName.replace('npm', 'git'))
        );
      }
    });
  });

  return Promise.all(copyPromises);
}

