# .NB Local Storage Strategy

## 1. IndexedDB Structure

### 1.1 Database Schema
```javascript
const DB_VERSION = 1;
const DB_NAME = "dotNB";

const stores = {
  notebooks: { keyPath: "id", indexes: ["userId", "updatedAt"] },
  sections: { keyPath: "id", indexes: ["notebookId", "updatedAt"] },
  subsections: { keyPath: "id", indexes: ["sectionId", "updatedAt"] },
  documents: { keyPath: "id", indexes: ["subsectionId", "updatedAt"] },
  syncQueue: { keyPath: "id", indexes: ["timestamp", "status"] },
  metadata: { keyPath: "id" }
};
```

### 1.2 Sync Queue Structure
```javascript
{
  id: string,
  operation: "CREATE" | "UPDATE" | "DELETE",
  entity: "notebook" | "section" | "subsection" | "document",
  entityId: string,
  data: Object,
  timestamp: number,
  status: "pending" | "processing" | "failed" | "completed",
  retryCount: number,
  error?: string
}
```

## 2. Sync Operations

### 2.1 Write Operations
1. Write to IndexedDB first
2. Add sync queue entry
3. Trigger background sync if online
4. Update UI immediately

### 2.2 Read Operations
1. Read from IndexedDB first
2. If data is stale (> 5 minutes), fetch from server
3. Update IndexedDB with fresh data
4. Update UI with fresh data

### 2.3 Delete Operations
1. Mark as deleted in IndexedDB
2. Add to sync queue
3. Remove from UI immediately
4. Clean up after successful sync
```

Next, let's define the security implementation:

```markdown project="Dot NB" file="docs/security-implementation.md" type="markdown"
# .NB Security Implementation

## 1. Authentication

### 1.1 JWT Implementation
```javascript
const JWT_CONFIG = {
  algorithm: "HS256",
  expiresIn: "24h",
  issuer: "dot-nb"
};

const TOKEN_REFRESH_THRESHOLD = 1800; // 30 minutes
```

### 1.2 Password Security
- Argon2 for password hashing
- Minimum password requirements:
  - 8 characters
  - 1 uppercase
  - 1 lowercase
  - 1 number
  - 1 special character

## 2. Data Encryption

### 2.1 Client-Side Encryption
```javascript
const ENCRYPTION_CONFIG = {
  algorithm: "AES-GCM",
  keyLength: 256,
  ivLength: 12
};

// Key Derivation
const deriveKey = async (password, salt) => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );
  
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
};
```

### 2.2 Secure Storage
- Encryption keys never sent to server
- Master key derived from user password
- Unique key per secure notebook
- Key rotation policy

## 3. API Security

### 3.1 Request Security
- CSRF protection
- Rate limiting
- Request validation
- SQL injection prevention
- XSS prevention

### 3.2 Response Security
- CORS configuration
- Security headers
- Content Security Policy
```

Now, let's define the client-side state management:

```markdown project="Dot NB" file="docs/state-management.md" type="markdown"
# .NB State Management Architecture

## 1. Store Structure

### 1.1 Global Store
```typescript
interface GlobalState {
  auth: {
    user: User | null;
    isAuthenticated: boolean;
    token: string | null;
  };
  ui: {
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    activeNotebook: string | null;
    activeSection: string | null;
    activeDocument: string | null;
  };
  sync: {
    status: 'idle' | 'syncing' | 'error';
    lastSync: Date | null;
    pendingChanges: number;
  };
  offline: {
    isOnline: boolean;
    lastOnline: Date | null;
  };
}
```

### 1.2 Entity Store
```typescript
interface EntityState {
  notebooks: {
    byId: Record<string, Notebook>;
    allIds: string[];
    loading: boolean;
    error: Error | null;
  };
  sections: {
    byId: Record<string, Section>;
    allIds: string[];
    loading: boolean;
    error: Error | null;
  };
  documents: {
    byId: Record<string, Document>;
    allIds: string[];
    loading: boolean;
    error: Error | null;
  };
}
```

## 2. Actions & Effects

### 2.1 Sync Actions
```typescript
type SyncAction = 
  | { type: 'SYNC_START' }
  | { type: 'SYNC_SUCCESS', payload: SyncResult }
  | { type: 'SYNC_ERROR', error: Error }
  | { type: 'SYNC_COMPLETE' };

type EntityAction =
  | { type: 'ENTITY_CREATE', payload: Entity }
  | { type: 'ENTITY_UPDATE', payload: Partial<Entity> }
  | { type: 'ENTITY_DELETE', payload: string };
```

### 2.2 Effects
```typescript
const syncEffect = (action$: Observable<Action>) =>
  action$.pipe(
    ofType('SYNC_START'),
    switchMap(() => performSync()),
    map(result => ({ type: 'SYNC_SUCCESS', payload: result })),
    catchError(error => of({ type: 'SYNC_ERROR', error }))
  );
```

## 3. Selectors

### 3.1 Memoized Selectors
```typescript
const selectActiveNotebook = createSelector(
  [(state: RootState) => state.notebooks.byId,
   (state: RootState) => state.ui.activeNotebook],
  (notebooks, activeId) => activeId ? notebooks[activeId] : null
);

const selectDocumentsForSection = createSelector(
  [(state: RootState) => state.documents.byId,
   (state: RootState, sectionId: string) => sectionId],
  (documents, sectionId) => 
    Object.values(documents).filter(doc => doc.sectionId === sectionId)
);
```
```

Finally, let's define the offline-first sync strategy:

```markdown project="Dot NB" file="docs/offline-sync-strategy.md" type="markdown"
# .NB Offline-First Sync Strategy

## 1. Core Principles

### 1.1 Optimistic Updates
- Apply changes immediately to local state
- Queue changes for sync
- Handle conflict resolution
- Rollback on failure

### 1.2 Conflict Resolution
```typescript
interface ConflictResolution {
  strategy: 'client-wins' | 'server-wins' | 'manual';
  resolution?: 'keep-both' | 'merge' | 'discard';
  mergeStrategy?: 'latest' | 'custom';
}

const resolveConflict = async (
  clientVersion: Document,
  serverVersion: Document,
  strategy: ConflictResolution
): Promise<Document> => {
  switch (strategy.strategy) {
    case 'client-wins':
      return clientVersion;
    case 'server-wins':
      return serverVersion;
    case 'manual':
      return await promptUserForResolution(clientVersion, serverVersion);
  }
};
```

## 2. Sync Process

### 2.1 Background Sync
```typescript
interface SyncProcess {
  interval: number;
  maxRetries: number;
  backoffMultiplier: number;
  syncBatchSize: number;
}

const SYNC_CONFIG: SyncProcess = {
  interval: 30000, // 30 seconds
  maxRetries: 5,
  backoffMultiplier: 1.5,
  syncBatchSize: 50
};
```

### 2.2 Change Detection
```typescript
interface ChangeRecord {
  entity: string;
  operation: 'create' | 'update' | 'delete';
  timestamp: number;
  data: any;
  version: number;
}

const detectChanges = (
  localState: EntityState,
  serverState: EntityState
): ChangeRecord[] => {
  // Implementation
};
```

## 3. Recovery Strategies

### 3.1 Error Recovery
```typescript
interface RecoveryStrategy {
  type: 'retry' | 'rollback' | 'manual';
  maxAttempts: number;
  backoffDelay: number;
}

const handleSyncError = async (
  error: Error,
  context: SyncContext,
  strategy: RecoveryStrategy
): Promise<void> => {
  // Implementation
};
```

### 3.2 Data Reconciliation
```typescript
interface ReconciliationResult {
  accepted: string[];
  rejected: string[];
  conflicts: ConflictRecord[];
}

const reconcileChanges = async (
  localChanges: ChangeRecord[],
  serverChanges: ChangeRecord[]
): Promise<ReconciliationResult> => {
  // Implementation
};
```

## 4. Performance Optimization

### 4.1 Batch Processing
- Group similar operations
- Prioritize critical updates
- Defer non-essential syncs

### 4.2 Storage Optimization
- Compress large documents
- Clean up old versions
- Manage storage quotas
```

Would you like to:
1. Review and refine any specific part of these implementations?
2. Move forward with the UI component architecture?
3. Define the testing strategy?
4. Create the deployment and CI/CD pipeline specification?

Let me know which aspect you'd like to explore next!