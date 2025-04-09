# .NB Database Specification

## 1. Collections Overview

### 1.1 Users Collection
```javascript
{
  _id: ObjectId,
  username: String,          // Required, Unique, Indexed
  email: String,            // Required, Unique, Indexed
  password: String,         // Required, Hashed
  settings: {
    theme: String,
    fontSize: Number,
    defaultNotebook: ObjectId
  },
  created_at: Date,
  updated_at: Date
}
```
**Indexes:**
- `username`: 1 (unique)
- `email`: 1 (unique)

### 1.2 Notebooks Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,        // Required, Indexed
  name: String,             // Required
  description: String,
  is_secure: Boolean,       // Required, Default: false
  encryption_key: String,   // Only for secure notebooks
  order: Number,            // For custom ordering
  created_at: Date,
  updated_at: Date,
  last_accessed: Date
}
```
**Indexes:**
- `user_id`: 1
- `user_id`: 1, `name`: 1 (unique)
- `is_secure`: 1

### 1.3 Sections Collection
```javascript
{
  _id: ObjectId,
  notebook_id: ObjectId,    // Required, Indexed
  name: String,             // Required
  description: String,
  order: Number,            // For custom ordering
  created_at: Date,
  updated_at: Date
}
```
**Indexes:**
- `notebook_id`: 1
- `notebook_id`: 1, `name`: 1 (unique)

### 1.4 Subsections Collection
```javascript
{
  _id: ObjectId,
  section_id: ObjectId,     // Required, Indexed
  name: String,             // Required
  description: String,
  order: Number,            // For custom ordering
  created_at: Date,
  updated_at: Date
}
```
**Indexes:**
- `section_id`: 1
- `section_id`: 1, `name`: 1 (unique)

### 1.5 Documents Collection
```javascript
{
  _id: ObjectId,
  subsection_id: ObjectId,  // Required, Indexed
  title: String,            // Required
  content: String,          // Required, Rich text content
  is_encrypted: Boolean,    // For documents in secure notebooks
  metadata: {
    tags: [String],
    created_by: ObjectId,
    last_modified_by: ObjectId
  },
  attachments: [{
    name: String,
    type: String,
    size: Number,
    url: String
  }],
  version_history: [{
    version: Number,
    content: String,
    modified_at: Date,
    modified_by: ObjectId
  }],
  created_at: Date,
  updated_at: Date
}
```
**Indexes:**
- `subsection_id`: 1
- `metadata.tags`: 1
- Text index on `title` and `content` for search functionality

## 2. Local Storage Structure

### 2.1 IndexedDB Structure
```javascript
{
  notebooks: [/* Mirror of Notebooks Collection */],
  sections: [/* Mirror of Sections Collection */],
  subsections: [/* Mirror of Subsections Collection */],
  documents: [/* Mirror of Documents Collection */],
  syncStatus: {
    lastSync: Date,
    pendingChanges: [{
      type: String,         // 'create', 'update', 'delete'
      collection: String,
      documentId: String,
      changes: Object,
      timestamp: Date
    }]
  }
}
```

## 3. Data Validation Rules

### 3.1 User Validation
- Username: 3-30 characters, alphanumeric
- Email: Valid email format
- Password: Minimum 8 characters, must include numbers and special characters

### 3.2 Content Validation
- Notebook names: 1-50 characters
- Section/Subsection names: 1-100 characters
- Document titles: 1-200 characters
- Content size: Maximum 10MB per document
- Attachment size: Maximum 50MB per file

## 4. Security Measures

### 4.1 Encryption
- Secure notebooks use AES-256 encryption
- Encryption keys stored using secure key derivation
- Client-side encryption for sensitive notebooks

### 4.2 Access Control
- Document-level access control
- Notebook-level security settings
- Version history tracking

## 5. Performance Considerations

### 5.1 Indexing Strategy
- Compound indexes for frequently accessed patterns
- Text indexes for search functionality
- Sparse indexes for optional fields

### 5.2 Data Loading
- Lazy loading for document content
- Pagination for large datasets
- Caching strategy for frequently accessed data
```

Would you like to:
1. Review and refine any specific part of this database design?
2. Move forward with API endpoint specifications?
3. Define the security implementation details?
4. Create the local storage synchronization strategy?

Let me know which aspect you'd like to explore next!