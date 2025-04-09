# 1. Project Overview & Architecture Responses

## 1.1 Primary User Personas

### Student Persona
- Name: Academic Alex
- Characteristics:
  - College/University student
  - Needs to organize course notes
  - Works primarily on laptop/desktop
  - Requires offline access
  - Limited technical expertise
- Key Needs:
  - Easy organization by subjects/courses
  - Quick note-taking capabilities
  - Support for attachments (PDFs, images)
  - Ability to export notes for sharing

### Professional Persona
- Name: Private Patricia
- Characteristics:
  - Professional working with sensitive data
  - Needs secure storage for credentials
  - Works across multiple devices
  - Moderate technical expertise
- Key Needs:
  - Secure notebook feature
  - Password protection
  - Clean, professional interface
  - Quick access to frequently used notes

## 1.2 Notebook Use Cases

### General Notebooks
- Purpose: Day-to-day note-taking and organization
- Features:
  - Basic text formatting
  - Image insertion
  - Table creation
  - Link management
- Storage: Plain text in IndexedDB
- Limitations: None

### Secure Notebooks
- Purpose: Storing sensitive information
- Features:
  - Password protection
  - Automatic locking after inactivity
  - Encrypted storage
  - No auto-sync/export
- Storage: Encrypted in IndexedDB
- Security Measures:
  ```typescript
  const SECURE_NOTEBOOK_CONFIG = {
    autoLockTimeout: 5 * 60 * 1000, // 5 minutes
    maxPasswordAttempts: 3,
    passwordRequirements: {
      minLength: 12,
      requireNumbers: true,
      requireSpecialChars: true,
      requireUppercase: true,
      requireLowercase: true
    }
  };
  ```

## 1.3 Storage Limits

### Document Limits
```typescript
const STORAGE_LIMITS = {
  document: {
    maxSize: 5 * 1024 * 1024, // 5MB per document
    maxTitleLength: 255,
    maxVersions: 10
  },
  attachment: {
    maxSize: 10 * 1024 * 1024, // 10MB per attachment
    maxPerDocument: 5,
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain'
    ]
  },
  total: {
    warningThreshold: 0.8, // 80% of available space
    criticalThreshold: 0.95 // 95% of available space
  }
};
```

## 1.4 Storage Quota Management

### Quota Monitoring
```typescript
class StorageMonitor {
  async checkQuota(): Promise<{
    used: number,
    available: number,
    percentage: number
  }> {
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage || 0,
      available: estimate.quota || 0,
      percentage: (estimate.usage || 0) / (estimate.quota || 1)
    };
  }

  async shouldWarnUser(): Promise<boolean> {
    const { percentage } = await this.checkQuota();
    return percentage >= STORAGE_LIMITS.total.warningThreshold;
  }
}
```

### Quota Exceeded Handling
```typescript
class QuotaManager {
  async handleQuotaExceeded(): Promise<void> {
    // 1. Identify large content
    const largeContent = await this.identifyLargeContent();

    // 2. Suggest actions
    const suggestions = this.generateSuggestions(largeContent);

    // 3. Present options to user
    return this.presentQuotaOptions(suggestions);
  }

  private async identifyLargeContent(): Promise<Array<{
    type: 'document' | 'attachment',
    id: string,
    size: number,
    lastAccessed: number
  }>> {
    // Implementation to find largest content items
    return [];
  }

  private generateSuggestions(largeContent: any[]): string[] {
    return [
      'Delete unused attachments',
      'Export and delete old notebooks',
      'Clear document version history',
      'Remove duplicate content'
    ];
  }
}
```

### Automatic Cleanup Strategies
```typescript
const cleanupStrategies = {
  async cleanVersionHistory(maxVersions: number = 5): Promise<number> {
    // Implementation to remove old versions
    return 0;
  },

  async removeUnusedAttachments(): Promise<number> {
    // Implementation to remove orphaned attachments
    return 0;
  },

  async compressOldDocuments(): Promise<number> {
    // Implementation to compress rarely accessed documents
    return 0;
  }
};
```