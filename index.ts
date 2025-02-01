import assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Extracts import dependencies from the provided file content.
 * Supports both ES6-style imports and CommonJS require calls.
 *
 * @param content - The source code content as a string.
 * @returns An array of module specifiers (dependencies) imported in the file.
 */
export function extractDependencies(content: string): string[] {
  const dependencies = new Set<string>();

  // Regex for ES6 import statements:
  //   Examples: 
  //     import foo from 'bar';
  //     import { baz } from "qux";
  //     import 'side-effect';
  const importRegex = /import\s+(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    dependencies.add(match[1]);
  }

  // Regex for CommonJS require calls:
  //   Example: const x = require('module');
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((match = requireRegex.exec(content)) !== null) {
    dependencies.add(match[1]);
  }

  return Array.from(dependencies);
}

/**
 * Checks if a file path matches a given wildcard pattern.
 * Supports:
 *   - Single "*" that matches any sequence of characters except "/".
 *   - Double "**" that matches any sequence (including "/" characters).
 *
 * This function uses a helper that converts a glob pattern into a regular expression.
 *
 * @param filePath - The file path string.
 * @param pattern  - The wildcard pattern.
 * @returns true if the filePath matches the pattern; otherwise, false.
 */
export function matchWildcard(filePath: string, pattern: string): boolean {
  function globToRegex(glob: string): string {
    const doubleStarPlaceholder = '__DS__';
    let prefix = '^';
    // If the glob pattern starts with "**/", allow the initial directory to be optional.
    if (glob.startsWith('**/')) {
      prefix = '^(?:.*\\/)?';
      glob = glob.slice(3);
    }
    // Replace all occurrences of "**" with a placeholder.
    glob = glob.replace(/\*\*/g, doubleStarPlaceholder);
    // Escape regex special characters.
    glob = glob.replace(/([.+^${}()|[\]\\])/g, '\\$1');
    // Replace remaining "*" (single star) with a pattern that matches any characters except "/".
    glob = glob.replace(/\*/g, '[^/]*');
    // Replace the placeholder with ".*" to match any sequence (including "/").
    glob = glob.replace(new RegExp(doubleStarPlaceholder, 'g'), '.*');
    return prefix + glob + '$';
  }
  const regexString = globToRegex(pattern);
  const regex = new RegExp(regexString);
  return regex.test(filePath);
}

/**
 * Filters out file paths that match any of the provided ignore patterns.
 * This version checks both the full file path and the basename.
 *
 * @param filePaths      - Array of file path strings.
 * @param ignorePatterns - Array of wildcard ignore patterns.
 * @returns An array of file paths that do not match any ignore pattern.
 */
export function filterIgnoredFiles(filePaths: string[], ignorePatterns: string[]): string[] {
  return filePaths.filter(filePath => {
    const baseName = path.basename(filePath);
    return !ignorePatterns.some(pattern =>
      matchWildcard(filePath, pattern) || matchWildcard(baseName, pattern)
    );
  });
}

/**
 * Filters an array of file paths to include only those with one of the allowed extensions.
 *
 * @param filePaths  - Array of file path strings.
 * @param extensions - Array of allowed extensions (e.g., [".js", ".ts"]).
 * @returns An array of file paths that have one of the allowed extensions.
 */
export function filterByExtension(filePaths: string[], extensions: string[]): string[] {
  return filePaths.filter(filePath => extensions.includes(path.extname(filePath)));
}

/**
 * Parses a comma-separated string of ignore patterns.
 *
 * @param ignoreStr - Comma-separated string (e.g., "node_modules/*, src/ignore.ts").
 * @returns An array of trimmed, non-empty ignore patterns.
 */
export function parseIgnorePatterns(ignoreStr: string): string[] {
  if (!ignoreStr) return [];
  return ignoreStr.split(',').map(s => s.trim()).filter(Boolean);
}

/* ---------------------------------------------------------------------------
   Impure Functions (File System Access)
--------------------------------------------------------------------------- */

/**
 * Recursively collects all file paths in the specified directory.
 *
 * @param dir - The directory to search.
 * @returns A promise that resolves to an array of file path strings.
 */
export async function getAllFiles(dir: string): Promise<string[]> {
  let results: string[] = [];
  const list = await fs.promises.readdir(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = await fs.promises.stat(fullPath);
    if (stat && stat.isDirectory()) {
      const subFiles = await getAllFiles(fullPath);
      results = results.concat(subFiles);
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Main function:
 * 1. Reads the root directory (and subdirectories) for .js and .ts files.
 * 2. Filters files using the provided ignore patterns.
 * 3. Reads each file’s content and extracts its dependencies.
 * 4. Prints the file name and its dependencies.
 */
export async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Usage: node index.js <rootDir> [ignorePatterns]");
    process.exit(1);
  }
  const rootDir = args[0];
  const ignoreStr = args[1] || "";
  const ignorePatterns = parseIgnorePatterns(ignoreStr);
  let files = await getAllFiles(rootDir);
  files = filterByExtension(files, ['.js', '.ts']);
  files = filterIgnoredFiles(files, ignorePatterns);
  for (const file of files) {
    try {
      const content = await fs.promises.readFile(file, 'utf8');
      const dependencies = extractDependencies(content);
      console.log(`File: ${file}`);
      console.log("Dependencies:");
      dependencies.forEach(dep => console.log(`  ${dep}`));
      console.log('--------------------');
    } catch (err) {
      console.error(`Error reading file ${file}:`, err);
    }
  }
}

/* ---------------------------------------------------------------------------
   Unit Tests
--------------------------------------------------------------------------- */

/**
 * Runs unit tests for all pure functions and failed iterations.
 */
export function runTests(): void {
  console.log("Running tests...");

  // --- Test extractDependencies ---
  {
    const content = `
      import foo from 'bar';
      import { baz } from "qux";
      import 'side-effect';
      const lib = require('library');
      const other = require("other-lib");
    `;
    const deps = extractDependencies(content);
    assert(deps.includes('bar'), "extractDependencies: Should include 'bar'");
    assert(deps.includes('qux'), "extractDependencies: Should include 'qux'");
    assert(deps.includes('side-effect'), "extractDependencies: Should include 'side-effect'");
    assert(deps.includes('library'), "extractDependencies: Should include 'library'");
    assert(deps.includes('other-lib'), "extractDependencies: Should include 'other-lib'");
  }

  // --- Test matchWildcard ---
  {
    // Single star: matches any characters except '/'
    assert.strictEqual(matchWildcard('src/index.ts', 'src/*.ts'), true, "matchWildcard: 'src/index.ts' should match 'src/*.ts'");
    // Should not match if a directory separator is present in the wildcard region.
    assert.strictEqual(matchWildcard('src/test/index.ts', 'src/*.ts'), false, "matchWildcard: 'src/test/index.ts' should not match 'src/*.ts'");
    // Double star: matches across directories.
    assert.strictEqual(matchWildcard('src/test/index.ts', 'src/**/*.ts'), true, "matchWildcard: 'src/test/index.ts' should match 'src/**/*.ts'");
    // Basic patterns.
    assert.strictEqual(matchWildcard('file.txt', '*.txt'), true, "matchWildcard: 'file.txt' should match '*.txt'");
    assert.strictEqual(matchWildcard('folder/file.txt', '*.txt'), false, "matchWildcard: 'folder/file.txt' should not match '*.txt'");
    // Additional tests for ignore patterns.
    assert.strictEqual(matchWildcard('jest.config.js', 'jest*'), true, "matchWildcard: 'jest.config.js' should match 'jest*'");
    assert.strictEqual(matchWildcard('client-type-identification.test.ts', '*test*'), true, "matchWildcard: 'client-type-identification.test.ts' should match '*test*'");
  }

  // --- Test filterIgnoredFiles (with basename checking) ---
  {
    const files = [
      'src/index.ts',
      'src/test.ts',
      'node_modules/lib.js',
      '../eliza/agent/jest.config.js',
      '../eliza/agent/src/__tests__/client-type-identification.test.ts'
    ];
    // Ignore patterns:
    //   - "**/node_modules/**": Ignore files in any node_modules folder.
    //   - "**/jest*": Ignore files whose basename starts with "jest".
    //   - "*test*": Ignore files whose basename contains "test".
    const ignorePatterns = ['**/node_modules/**', '**/jest*', '*test*'];
    const filtered = filterIgnoredFiles(files, ignorePatterns);
    // Expected remaining file: 'src/index.ts'
    assert.strictEqual(filtered.length, 1, "filterIgnoredFiles: Should filter out ignored files");
    assert.ok(filtered.includes('src/index.ts'), "filterIgnoredFiles: 'src/index.ts' should remain");
  }

  // --- Test parseIgnorePatterns ---
  {
    const patterns = parseIgnorePatterns('node_modules/*, src/ignore.ts');
    assert.deepStrictEqual(patterns, ['node_modules/*', 'src/ignore.ts'], "parseIgnorePatterns: Should split and trim ignore patterns");
  }

  // --- Test filterByExtension ---
  {
    const allFiles = ['a.ts', 'b.js', 'c.txt'];
    const tsJsFiles = filterByExtension(allFiles, ['.ts', '.js']);
    assert.deepStrictEqual(tsJsFiles, ['a.ts', 'b.js'], "filterByExtension: Should filter to .ts and .js files only");
  }

  console.log("All tests passed!");
}

/* ---------------------------------------------------------------------------
   Execution Entry Point
--------------------------------------------------------------------------- */

if (require.main === module) {
  if (process.argv.includes('--test')) {
    runTests();
  } else {
    main().catch(err => {
      console.error("An error occurred:", err);
      process.exit(1);
    });
  }
}
