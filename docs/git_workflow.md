# Git Workflow Documentation

## 1. Branch Strategy

### 1.1 Branch Naming
```bash
# Feature branches
feature/[issue-number]-brief-description

# Bug fixes
fix/[issue-number]-brief-description

# Documentation
docs/topic-name

# Examples
feature/123-add-document-encryption
fix/124-fix-autosave-bug
docs/api-documentation
```

## 2. Commit Guidelines

### 2.1 Commit Message Format
```bash
# Format
<type>(<scope>): <subject>

# Types
feat: A new feature
fix: A bug fix
docs: Documentation only changes
style: Changes that don't affect the meaning of the code
refactor: A code change that neither fixes a bug nor adds a feature
test: Adding missing tests or correcting existing tests
chore: Changes to the build process or auxiliary tools

# Examples
feat(editor): add support for tables
fix(storage): resolve IndexedDB quota exceeded error
docs(readme): update installation instructions
```