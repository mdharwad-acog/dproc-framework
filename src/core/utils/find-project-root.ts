
import * as path from 'path';
import * as fs from 'fs';

/**
 * Synchronously finds the project root by searching for 'pnpm-workspace.yaml'
 * or 'package.json' in the current directory and its ancestors.
 *
 * @param startPath The directory to start searching from. Defaults to the current working directory.
 * @returns The absolute path to the project root, or null if not found.
 */
export function findProjectRootSync(startPath: string = process.cwd()): string | null {
  let currentPath = startPath;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const pnpmWorkspacePath = path.join(currentPath, 'pnpm-workspace.yaml');
    const packageJsonPath = path.join(currentPath, 'package.json');

    if (fs.existsSync(pnpmWorkspacePath) || fs.existsSync(packageJsonPath)) {
      return currentPath;
    }

    const parentPath = path.dirname(currentPath);
    if (parentPath === currentPath) {
      // Reached the root of the filesystem
      return null;
    }
    currentPath = parentPath;
  }
}
