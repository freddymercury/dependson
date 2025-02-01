# DependsOn

**DependsOn** is a Node.js tool written in TypeScript that scans a specified root directory (and its subdirectories) for JavaScript (.js) and TypeScript (.ts) files, extracts their import dependencies (supporting both ES6 imports and CommonJS `require` calls), and prints a list of these dependencies. It also allows you to ignore files or directories using flexible, comma-separated glob patterns.

## Features

- **Dependency Extraction:**  
  Extracts module specifiers from both ES6-style `import` statements and CommonJS `require()` calls.

- **Custom Ignore Patterns:**  
  Accepts a comma-separated list of wildcard patterns (with support for single `*` and double `**`) to ignore files.  
  - Single asterisk (`*`): Matches any sequence of characters except for the path separator (`/`).  
  - Double asterisk (`**`): Matches any sequence of characters including `/`.  
  - Ignore patterns are applied to both the full file path and the file’s basename.

- **Pure Functions & Unit Tests:**  
  Core logic is implemented using pure functions with comprehensive unit tests to verify behavior and catch regressions.

- **Out-of-the-box Execution:**  
  Run the tool directly using `ts-node` with npm scripts, without needing a separate build step.

## Requirements

- **Node.js:** Version 14 or later is recommended.
- **TypeScript:** The project uses TypeScript, and it is configured to compile to CommonJS.
- **ts-node:** Used to run the TypeScript code directly.

## Installation

1. **Clone the repository or copy the project files.**

2. **Install the dependencies:**

   ```bash
   npm install --save-dev typescript ts-node @types/node
