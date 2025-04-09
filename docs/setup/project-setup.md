# Project Setup Guide

## 1. Development Environment Setup

### 1.1 Prerequisites
```bash
# Required versions
Node.js >= 18.0.0
npm >= 8.0.0
Git >= 2.30.0

# Required GitHub Account for backup integration
GitHub account with repository creation permissions
```

### 1.2 Initial Setup
```bash
# Create project
npm create vite@latest dot-nb -- --template react-ts

# Navigate to project
cd dot-nb

# Install core dependencies
npm install @mantine/core @mantine/hooks @mantine/tiptap
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-table
npm install idb localforage crypto-js
npm install @octokit/rest @octokit/auth-token
npm install @testing-library/react @testing-library/jest-dom vitest
npm install tailwindcss postcss autoprefixer
npm install react-router-dom
npm install pako # for compression

# Initialize Tailwind CSS
npx tailwindcss init -p
```

### 1.3 Project Structure
```
dot-nb/
├── src/
│   ├── components/
│   │   ├── core/           # Core application components
│   │   │   ├── Editor/
│   │   │   ├── Notebook/
│   │   │   └── Section/
│   │   ├── ui/            # Reusable UI components
│   │   └── features/      # Feature-specific components
│   ├── lib/
│   │   ├── storage/       # Storage implementations
│   │   │   ├── local.ts
│   │   │   └── github.ts
│   │   ├── editor/
│   │   └── security/
│   ├── features/          # Feature modules
│   │   ├── notebooks/
│   │   ├── documents/
│   │   └── export/
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   └── types/           # TypeScript types
├── public/
└── tests/
```

### 1.4 Environment Configuration
```env
# GitHub Integration
GITHUB_TOKEN=your_github_token
GITHUB_USERNAME=your_username

# Feature Flags
ENABLE_GITHUB_BACKUP=true
ENABLE_COMPRESSION=true
```