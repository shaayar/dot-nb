# .NB Client-Side State Management

## 1. Store Structure

### 1.1 Application State
```typescript
interface AppState {
  notebooks: {
    items: Record<string, Notebook>;
    activeId: string | null;
    isLoading: boolean;
    error: Error | null;
  };
  
  sections: {
    items: Record<string, Section>;
    activeId: string | null;
    isLoading: boolean;
  };
  
  documents: {
    items: Record<string, Document>;
    activeId: string | null;
    isLoading: boolean;
    unsavedChanges: Record<string, boolean>;
  };
  
  ui: {
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    modal: {
      isOpen: boolean;
      type: string | null;
      data: any;
    };
  };
  
  settings: {
    autoSave: boolean;
    fontSize: number;
    lineSpacing: number;
    lastBackup: Date | null;
  };
}
```

### 1.2 Actions
```typescript
type AppAction =
  | { type: 'NOTEBOOK_CREATE', payload: Notebook }
  | { type: 'NOTEBOOK_UPDATE', payload: Partial<Notebook> }
  | { type: 'NOTEBOOK_DELETE', payload: string }
  | { type: 'DOCUMENT_SAVE', payload: { id: string, content: string } }
  | { type: 'SETTINGS_UPDATE', payload: Partial<Settings> };

const actionCreators = {
  createNotebook: (notebook: Notebook): AppAction => ({
    type: 'NOTEBOOK_CREATE',
    payload: notebook
  }),
  
  saveDocument: (id: string, content: string): AppAction => ({
    type: 'DOCUMENT_SAVE',
    payload: { id, content }
  })
};
```

## 2. State Management Implementation

### 2.1 Store Implementation
```typescript
class Store {
  private state: AppState;
  private listeners: Set<(state: AppState) => void>;
  
  constructor(initialState: AppState) {
    this.state = initialState;
    this.listeners = new Set();
  }
  
  getState(): AppState {
    return this.state;
  }
  
  dispatch(action: AppAction) {
    this.state = reducer(this.state, action);
    this.notify();
  }
  
  subscribe(listener: (state: AppState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  private notify() {
    this.listeners.forEach(listener => listener(this.state));
  }
}
```

### 2.2 Local Storage Integration
```typescript
const storageMiddleware = (store: Store) => {
  store.subscribe((state) => {
    // Save specific parts of state to IndexedDB
    const persistedData = {
      notebooks: state.notebooks,
      settings: state.settings
    };
    
    saveToIndexedDB('appState', persistedData);
  });
};
```

## 3. Performance Optimizations

### 3.1 Memoization
```typescript
const memoizedSelectors = {
  getActiveNotebook: createSelector(
    (state: AppState) => state.notebooks.items,
    (state: AppState) => state.notebooks.activeId,
    (notebooks, activeId) => activeId ? notebooks[activeId] : null
  ),
  
  getUnsavedDocuments: createSelector(
    (state: AppState) => state.documents.unsavedChanges,
    (unsavedChanges) => Object.keys(unsavedChanges).filter(id => unsavedChanges[id])
  )
};
```

### 3.2 Batch Updates
```typescript
const batchUpdateMiddleware = (store: Store) => {
  let batchTimeout: number | null = null;
  let actions: AppAction[] = [];
  
  return (action: AppAction) => {
    actions.push(action);
    
    if (!batchTimeout) {
      batchTimeout = window.setTimeout(() => {
        store.dispatch({ type: 'BATCH_UPDATE', payload: actions });
        actions = [];
        batchTimeout = null;
      }, 100);
    }
  };
};
```