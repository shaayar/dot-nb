# .NB (Dot Notebook) Documentation

## Overview

.NB is a web-based notebook application that allows users to create, organize, and manage their notes efficiently. It operates entirely client-side, utilizing browser storage capabilities and optional GitHub integration for backup.

## Core Features

### 1\. Storage Architecture

- Local-first approach using IndexedDB
- Automatic compression for large documents
- GitHub integration for backup
- Export/Import functionality for data portability

### 2\. Organization Structure

- Unlimited notebook organization
- Hierarchical structure: Notebook → Section → Sub-section → Sub-section
- No artificial limits on sections or documents
- Flexible categorization and tagging

### 3\. Document Management

- Rich text editing
- Image and URL support
- Table creation
- Auto-save functionality
- Version history

### 4\. Import/Export

- Document formats: PDF, TXT
- Notebook format: .nb
- Section format: .sec
- Bulk export capabilities

## Technical Specifications

### 1\. Storage Limits

```typescript
const STORAGE_CONFIG = {
  document: {
    maxSize: {
      free: 3, // 3 documents in freemium
      premium: Infinity
    }
  },
  attachments: {
    types: ['image/*', 'text/*', 'application/pdf'],
    preferLinks: ['video/*']
  }
};
```

### 2\. Performance Targets

```typescript
const PERFORMANCE_TARGETS = {
  initialLoad: 2000, // 2 seconds
  documentSave: 500, // 500ms
  searchResponse: 200 // 200ms
};
```

### 3\. Error Handling

- Toast notifications for user feedback
- Automatic recovery for unsaved changes
- Offline data persistence
- Sync conflict resolution

## User Types

### 1\. Free Tier

- Limited to 3 documents
- Basic features
- Local storage only

### 2\. Premium Tier

- Unlimited documents
- Advanced features
- GitHub backup integration
- Enhanced export options

## Development

### 1\. Technology Stack

- Frontend: React + TypeScript
- Build Tool: Vite
- Storage: IndexedDB
- State Management: Custom implementation
- Testing: Vitest + Testing Library

### 2\. Project Structure

```
dot-nb/
├── src/
│   ├── components/    # React components
│   ├── lib/          # Core libraries
│   ├── features/     # Feature modules
│   ├── hooks/        # Custom React hooks
│   └── utils/        # Utility functions
├── docs/            # Documentation
└── tests/          # Test files
```

### 3\. Package Architecture

Each feature is developed and distributed as a separate package:

- Core notebook functionality (@dot-nb/core)
- Todo lists (future - @dot-nb/todo)
- Canvas for brainstorming (future - @dot-nb/canvas)
- Floating notes (future - @dot-nb/float)

## Getting Started

### 1\. Installation

```bash
# Clone repository
git clone https://github.com/username/dot-nb.git

# Install dependencies
npm install

# Start development server
npm run dev
```

### 2\. Development Workflow

1. Create feature branch
2. Implement changes
3. Write tests
4. Submit pull request
5. Code review
6. Merge to main

### 3\. Testing

- Unit tests for components
- Integration tests for features
- Performance testing
- Accessibility testing

## Future Roadmap

### Phase 1: Core Features

- [x] Basic notebook functionality

- [x] Document management

- [x] Local storage implementation

- [ ] GitHub backup integration

### Phase 2: Enhanced Features

- [ ] Rich text editor improvements

- [ ] Advanced export options

- [ ] Search functionality

- [ ] Tags and categories

### Phase 3: Premium Features

- [ ] Todo lists package

- [ ] Canvas package

- [ ] Floating notes package

- [ ] Collaborative features

## Contributing

See [Contributing Guide](./development/contribution-guide.md) for detailed information about:

- Development setup
- Code standards
- Git workflow
- Pull request process

```

Would you like me to:
1. Create documentation for any of the remaining questions?
2. Add more detail to the main documentation?
3. Create additional specialized documentation?

Let me know how you'd like to proceed!
```