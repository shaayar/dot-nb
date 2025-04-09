# .NB Client Storage Strategy

## 1. Storage Architecture

### 1.1 IndexedDB as Primary Database
```javascript
const DB_VERSION = 1;
const DB_NAME = "dotNB";

const stores = {
  notebooks: { 
    keyPath: "id",
    indexes: [
      { name: "updatedAt", keyPath: "updatedAt" },
      { name: "name", keyPath: "name" }
    ]
  },
  sections: { 
    keyPath: "id",
    indexes: [
      { name: "notebookId", keyPath: "notebookId" },
      { name: "updatedAt", keyPath: "updatedAt" }
    ]
  },
  subsections: { 
    keyPath: "id",
    indexes: [
      { name: "sectionId", keyPath: "sectionId" },
      { name: "updatedAt", keyPath: "updatedAt" }
    ]
  },
  documents: { 
    keyPath: "id",
    indexes: [
      { name: "subsectionId", keyPath: "subsectionId" },
      { name: "updatedAt", keyPath: "updatedAt" },
      { name: "title", keyPath: "title" }
    ]
  },
  settings: { keyPath: "id" }
};
```

### 1.2 Storage Quotas and Management
```javascript
const STORAGE_LIMITS = {
  maxDocumentSize: 5 * 1024 * 1024, // 5MB per document
  maxAttachmentSize: 10 * 1024 * 1024, // 10MB per attachment
  warningThreshold: 0.8, // 80% of available space
};

const storageManager = {
  async checkAvailableSpace() {
    const estimate = await navigator.storage.estimate();
    return {
      available: estimate.quota - estimate.usage,
      percentageUsed: (estimate.usage / estimate.quota) * 100
    };
  },
  
  async cleanupOldVersions(keepVersions = 5) {
    // Implementation for cleaning up old document versions
  }
};
```

## 2. Data Persistence

### 2.1 Automatic Saving
```javascript
const AUTO_SAVE_CONFIG = {
  interval: 30000, // 30 seconds
  minChanges: 1, // minimum changes before save
  debounceTime: 1000 // 1 second debounce
};

const autoSaveManager = {
  lastSave: Date.now(),
  changeCount: 0,
  
  shouldSave(changes) {
    return this.changeCount >= AUTO_SAVE_CONFIG.minChanges;
  }
};
```

### 2.2 Backup Strategy
```javascript
const BACKUP_CONFIG = {
  autoBackupInterval: 24 * 60 * 60 * 1000, // 24 hours
  maxBackups: 3,
  format: 'json'
};

interface BackupData {
  timestamp: number;
  version: string;
  data: {
    notebooks: any[];
    sections: any[];
    subsections: any[];
    documents: any[];
    settings: any;
  };
}
```

## 3. Import/Export Functionality

### 3.1 Export Formats
```javascript
const EXPORT_FORMATS = {
  notebook: ['json', 'pdf', 'txt'],
  section: ['json', 'pdf', 'txt'],
  document: ['pdf', 'txt', 'md']
};

const exportManager = {
  async exportNotebook(notebookId, format) {
    // Implementation for exporting notebook
  },
  
  async exportDocument(documentId, format) {
    // Implementation for exporting document
  }
};
```

### 3.2 Import Handling
```javascript
const IMPORT_VALIDATORS = {
  json: async (data) => {
    // Validation implementation
  },
  txt: async (data) => {
    // Validation implementation
  }
};
```

## 4. Offline Capabilities

### 4.1 Service Worker Implementation
```javascript
const SW_CONFIG = {
  cacheName: 'dotNB-cache-v1',
  assets: [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/icons/*'
  ]
};
```

### 4.2 Cache Management
```javascript
const cacheManager = {
  async clearOldCaches() {
    // Implementation for clearing old caches
  },
  
  async preloadCommonAssets() {
    // Implementation for preloading assets
  }
};
```
```

Let me know if you'd like me to:
1. Update the security implementation for client-side only
2. Revise the state management architecture
3. Create a new data backup and recovery strategy
4. Define the offline functionality in more detail

Which aspect would you like me to focus on next?