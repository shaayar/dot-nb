# Notebook Management Feature Specification

## 1. User Stories

### 1.1 Basic Notebook Creation
As a user,
I want to create a new notebook,
so that I can organize my notes in separate collections.

#### Acceptance Criteria
1. Given I'm on the main dashboard
   When I click "New Notebook"
   Then I should see a form to create a notebook

2. Given I'm creating a notebook
   When I submit without a name
   Then I should see a validation error

3. Given I'm creating a notebook
   When I submit with a valid name
   Then the notebook should be created and appear in my list

### 1.2 Secure Notebook Creation
As a privacy-conscious user,
I want to create a password-protected notebook,
so that I can store sensitive information securely.

#### Acceptance Criteria
1. Given I'm creating a notebook
   When I toggle "Secure Notebook"
   Then I should be prompted to set a password

2. Given I'm setting a notebook password
   When I enter a weak password
   Then I should see password strength requirements

## 2. Technical Specification

### 2.1 Data Structure
```typescript
interface Notebook {
  id: string;
  name: string;
  description?: string;
  isSecure: boolean;
  created: number;
  updated: number;
  metadata: {
    totalDocuments: number;
    totalSections: number;
    lastAccessed: number;
  };
  settings: {
    defaultView: 'list' | 'grid';
    sortOrder: 'name' | 'created' | 'updated';
    theme?: 'light' | 'dark' | 'system';
  };
}

interface SecureNotebook extends Notebook {
  salt: string;
  iv: string;
  encryptedKey: string;
}
```

### 2.2 Storage Implementation
```typescript
const STORAGE_CONFIG = {
  maxNotebooks: 50,
  maxNameLength: 100,
  maxDescriptionLength: 500,
  defaultQuota: 50 * 1024 * 1024, // 50MB per notebook
};

class NotebookStorage {
  async create(notebook: Notebook): Promise<string> {
    const db = await openDB('dotNB', 1);
    return db.add('notebooks', notebook);
  }

  async get(id: string): Promise<Notebook | null> {
    const db = await openDB('dotNB', 1);
    return db.get('notebooks', id);
  }

  async update(id: string, updates: Partial<Notebook>): Promise<void> {
    const db = await openDB('dotNB', 1);
    const notebook = await db.get('notebooks', id);
    if (!notebook) throw new Error('Notebook not found');
    
    await db.put('notebooks', {
      ...notebook,
      ...updates,
      updated: Date.now()
    });
  }

  async delete(id: string): Promise<void> {
    const db = await openDB('dotNB', 1);
    await db.delete('notebooks', id);
  }
}
```

### 2.3 Security Implementation
```typescript
class NotebookSecurity {
  private readonly ENCRYPTION_CONFIG = {
    algorithm: 'AES-GCM',
    keyLength: 256,
    iterations: 100000
  };

  async createSecureNotebook(
    notebook: Notebook,
    password: string
  ): Promise<SecureNotebook> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const key = await this.deriveKey(password, salt);
    const encryptedKey = await this.encryptKey(key, iv);
    
    return {
      ...notebook,
      isSecure: true,
      salt: Array.from(salt).join(','),
      iv: Array.from(iv).join(','),
      encryptedKey
    };
  }

  private async deriveKey(
    password: string,
    salt: Uint8Array
  ): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: this.ENCRYPTION_CONFIG.iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      {
        name: this.ENCRYPTION_CONFIG.algorithm,
        length: this.ENCRYPTION_CONFIG.keyLength
      },
      true,
      ['encrypt', 'decrypt']
    );
  }
}
```

## 3. UI Components

### 3.1 Component Structure
```typescript
interface NotebookListProps {
  notebooks: Notebook[];
  onCreateNotebook: () => void;
  onSelectNotebook: (id: string) => void;
  onDeleteNotebook: (id: string) => void;
}

interface NotebookFormProps {
  onSubmit: (notebook: Partial<Notebook>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<Notebook>;
}

interface SecureNotebookDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
}
```

### 3.2 State Management
```typescript
interface NotebookState {
  notebooks: Record<string, Notebook>;
  activeNotebookId: string | null;
  isLoading: boolean;
  error: Error | null;
}

type NotebookAction =
  | { type: 'CREATE_NOTEBOOK'; payload: Notebook }
  | { type: 'UPDATE_NOTEBOOK'; payload: { id: string; updates: Partial<Notebook> } }
  | { type: 'DELETE_NOTEBOOK'; payload: string }
  | { type: 'SET_ACTIVE_NOTEBOOK'; payload: string };
```

## 4. Error Handling

### 4.1 Error Types
```typescript
class NotebookError extends Error {
  constructor(
    message: string,
    public code: 'VALIDATION' | 'STORAGE' | 'ENCRYPTION' | 'QUOTA',
    public details?: any
  ) {
    super(message);
    this.name = 'NotebookError';
  }
}

const ERROR_MESSAGES = {
  INVALID_NAME: 'Notebook name is required and must be less than 100 characters',
  QUOTA_EXCEEDED: 'Storage quota exceeded. Please delete some notebooks or content',
  ENCRYPTION_FAILED: 'Failed to encrypt notebook. Please try again',
  STORAGE_FAILED: 'Failed to save notebook. Please check your storage',
};
```

### 4.2 Error Recovery
```typescript
const notebookErrorHandler = {
  async handleError(error: NotebookError): Promise<void> {
    switch (error.code) {
      case 'QUOTA':
        await this.handleQuotaError();
        break;
      case 'STORAGE':
        await this.handleStorageError();
        break;
      case 'ENCRYPTION':
        await this.handleEncryptionError();
        break;
      default:
        console.error('Unhandled notebook error:', error);
    }
  },

  private async handleQuotaError(): Promise<void> {
    // Implementation for handling quota errors
  }
};
```

## 5. Testing Strategy

### 5.1 Unit Tests
```typescript
describe('NotebookStorage', () => {
  it('should create a notebook', async () => {
    const storage = new NotebookStorage();
    const notebook: Notebook = {
      id: '',
      name: 'Test Notebook',
      isSecure: false,
      created: Date.now(),
      updated: Date.now(),
      metadata: {
        totalDocuments: 0,
        totalSections: 0,
        lastAccessed: Date.now()
      },
      settings: {
        defaultView: 'list',
        sortOrder: 'name'
      }
    };

    const id = await storage.create(notebook);
    expect(id).toBeTruthy();
  });
});
```

### 5.2 Integration Tests
```typescript
describe('Notebook Management', () => {
  it('should create and encrypt secure notebook', async () => {
    const notebook = await createSecureNotebook({
      name: 'Secure Test',
      password: 'TestPassword123!'
    });

    expect(notebook.isSecure).toBe(true);
    expect(notebook.encryptedKey).toBeTruthy();
  });
});
```