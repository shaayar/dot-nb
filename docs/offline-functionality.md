# .NB Offline Functionality

## 1. Service Worker Implementation

### 1.1 Cache Configuration
```typescript
const CACHE_CONFIG = {
  version: 'v1',
  staticAssets: [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/fonts/*',
    '/icons/*'
  ],
  dynamicCache: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxItems: 100
  }
};

// Service Worker Registration
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered:', registration);
    } catch (error) {
      console.log('SW registration failed:', error);
    }
  }
};
```

### 1.2 Offline Detection
```typescript
const connectivityManager = {
  isOnline: navigator.onLine,
  
  init() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  },
  
  handleOnline() {
    this.isOnline = true;
    // Trigger sync if needed
  },
  
  handleOffline() {
    this.isOnline = false;
    // Enable offline mode UI
  }
};
```

## 2. Data Persistence

### 2.1 IndexedDB Operations
```typescript
const dbManager = {
  async saveDocument(doc: Document): Promise<void> {
    const db = await this.getDatabase();
    const tx = db.transaction('documents', 'readwrite');
    await tx.store.put(doc);
  },
  
  async getDocument(id: string): Promise<Document | null> {
    const db = await this.getDatabase();
    return db.get('documents', id);
  }
};
```

### 2.2 Change Tracking
```typescript
interface ChangeRecord {
  id: string;
  type: 'create' | 'update' | 'delete';
  timestamp: number;
  entity: 'notebook' | 'section' | 'document';
  data: any;
}

const changeTracker = {
  changes: new Set<ChangeRecord>(),
  
  trackChange(change: ChangeRecord) {
    this.changes.add(change);
    this.persistChanges();
  }
};
```