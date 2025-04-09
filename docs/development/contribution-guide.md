# Contribution Guide

## 1. Development Setup

### 1.1 Environment Setup
```bash
# Clone repository
git clone https://github.com/username/dot-nb.git

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

## 2. Code Standards

### 2.1 TypeScript Standards
```typescript
// Use interfaces for object definitions
interface ComponentProps {
  // Props definition
}

// Use type for unions/intersections
type Status = 'active' | 'inactive';

// Use enums for fixed values
enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}
```

### 2.2 Component Standards
```typescript
// Component template
import { FC } from 'react';

interface Props {
  // Props definition
}

export const ComponentName: FC<Props> = ({ prop1, prop2 }) => {
  // Implementation
};
```

## 3. Git Workflow

### 3.1 Branch Naming
```bash
# Feature branches
feature/[issue-number]-feature-name

# Bug fixes
fix/[issue-number]-bug-description

# Documentation
docs/topic-name
```

### 3.2 Commit Messages
```bash
# Format
<type>(<scope>): <description>

# Examples
feat(editor): add table support
fix(storage): resolve quota exceeded error
docs(readme): update installation steps
```

## 4. Pull Request Process

### 4.1 PR Template
```markdown
## Description
Brief description of changes

## Type of change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Code follows style guidelines
- [ ] All tests passing
```