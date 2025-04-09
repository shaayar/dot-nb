# Document Management Feature Specification

## 1. User Stories

### 1.1 Document Creation
As a note-taker,
I want to create and edit documents within my notebooks,
so that I can write and organize my content effectively.

#### Acceptance Criteria
1. Given I'm in a notebook
   When I click "New Document"
   Then I should see a new document editor

2. Given I'm editing a document
   When I type content
   Then it should be automatically saved

3. Given I'm editing a document
   When I lose connection
   Then my changes should be preserved locally

### 1.2 Rich Text Editing
As a content creator,
I want rich text formatting options,
so that I can create well-structured and formatted documents.

#### Acceptance Criteria
1. Given I'm in the editor
   When I select text
   Then I should see formatting options

2. Given I'm editing
   When I use keyboard shortcuts (Ctrl+B, etc.)
   Then the text should be formatted accordingly

## 2. Technical Specification

### 2.1 Data Structure
```typescript
interface Document {
  id: string;
  notebookId: string;
  sectionId?: string;
  title: string;
  content: JSONContent; // TipTap JSON content
  created: number;
  updated: number;
  version: number;
  metadata: {
    wordCount: number;
    readTime: number;
    lastAutosave: number;
    tags: string[];
  };
  isEncrypted: boolean;
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    data: Blob;
  }>;
}

interface DocumentVersion {
  id: string;
  documentId: string;
  content: JSONContent;
  timestamp: number;
  version: number;
}
```

### 2.2 Editor Implementation
```typescript
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';

const DocumentEditor: React.FC<{
  initialContent: JSONContent;
  onChange: (content: JSONContent) => void;
}> = ({ initialContent, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    autofocus: 'end',
  });

  return (
    <div className="document-editor">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};
```

### 2.3 Storage Implementation
```typescript
class DocumentStorage {
  private readonly DB_NAME = 'dotNB';
  private readonly STORE_NAME = 'documents';
  private readonly VERSION_STORE = 'documentVersions';

  async create(document: Document): Promise<string> {
    const db = await openDB(this.DB_NAME, 1);
    const tx = db.transaction([this.STORE_NAME], 'readwrite');
    const store = tx.objectStore(this.STORE_NAME);
    
    const id = await store.add({
      ...document,
      created: Date.now(),
      updated: Date.now(),
      version: 1
    });
    
    await tx.complete;
    return id.toString();
  }

  async saveVersion(documentId: string, content: JSONContent): Promise<void> {
    const db = await openDB(this.DB_NAME, 1);
    const doc = await this.get(documentId);
    
    if (!doc) throw new Error('Document not found');
    
    const version: DocumentVersion = {
      id: crypto.randomUUID(),
      documentId,
      content,
      timestamp: Date.now(),
      version: doc.version + 1
    };
    
    const tx = db.transaction([this.VERSION_STORE], 'readwrite');
    await tx.store.add(version);
    await tx.complete;
    
    // Update current document
    await this.update(documentId, {
      content,
      version: version.version,
      updated: version.timestamp
    });
  }

  async getVersions(documentId: string): Promise<DocumentVersion[]> {
    const db = await openDB(this.DB_NAME, 1);
    const versions = await db.getAllFromIndex(
      this.VERSION_STORE,
      'documentId',
      documentId
    );
    
    return versions.sort((a, b) => b.version - a.version);
  }
}
```

### 2.4 Auto-save Implementation
```typescript
const useAutoSave = (
  documentId: string,
  content: JSONContent,
  storage: DocumentStorage
) => {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<number>();

  const save = useCallback(async () => {
    if (saving) return;
    
    setSaving(true);
    try {
      await storage.saveVersion(documentId, content);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setSaving(false);
    }
  }, [documentId, content, storage, saving]);

  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = window.setTimeout(save, 2000);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, save]);

  return { saving, lastSaved };
};
```

## 3. UI Components

### 3.1 Document List
```typescript
interface DocumentListProps {
  documents: Document[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  sortBy: 'title' | 'updated' | 'created';
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onSelect,
  onDelete,
  sortBy
}) => {
  const sortedDocs = useMemo(() => {
    return [...documents].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'updated':
          return b.updated - a.updated;
        case 'created':
          return b.created - a.created;
        default:
          return 0;
      }
    });
  }, [documents, sortBy]);

  return (
    <div className="document-list">
      {sortedDocs.map(doc => (
        <div
          key={doc.id}
          className="document-item"
          onClick={() => onSelect(doc.id)}
        >
          <h3>{doc.title}</h3>
          <div className="document-meta">
            <span>Words: {doc.metadata.wordCount}</span>
            <span>Last updated: {formatDate(doc.updated)}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(doc.id);
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};
```

### 3.2 Document Toolbar
```typescript
interface ToolbarProps {
  editor: Editor | null;
  onSave: () => void;
  saving: boolean;
  lastSaved: Date | null;
}

const EditorToolbar: React.FC<ToolbarProps> = ({
  editor,
  onSave,
  saving,
  lastSaved
}) => {
  if (!editor) return null;

  return (
    <div className="editor-toolbar">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
      >
        Italic
      </button>
      <button onClick={onSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </button>
      {lastSaved && (
        <span className="last-saved">
          Last saved: {formatDate(lastSaved)}
        </span>
      )}
    </div>
  );
};
```

## 4. Error Handling

### 4.1 Storage Errors
```typescript
class DocumentError extends Error {
  constructor(
    message: string,
    public code: 'STORAGE' | 'VERSION' | 'QUOTA' | 'VALIDATION',
    public details?: any
  ) {
    super(message);
    this.name = 'DocumentError';
  }
}

const handleStorageError = async (error: DocumentError) => {
  switch (error.code) {
    case 'QUOTA':
      // Handle storage quota exceeded
      break;
    case 'VERSION':
      // Handle version conflict
      break;
    default:
      // Handle other errors
      break;
  }
};
```

## 5. Testing Strategy

### 5.1 Unit Tests
```typescript
describe('DocumentStorage', () => {
  it('should create and retrieve a document', async () => {
    const storage = new DocumentStorage();
    const doc: Document = {
      id: '',
      notebookId: 'test-notebook',
      title: 'Test Document',
      content: { type: 'doc', content: [] },
      created: Date.now(),
      updated: Date.now(),
      version: 1,
      metadata: {
        wordCount: 0,
        readTime: 0,
        lastAutosave: Date.now(),
        tags: []
      },
      isEncrypted: false,
      attachments: []
    };

    const id = await storage.create(doc);
    const retrieved = await storage.get(id);
    
    expect(retrieved).toBeTruthy();
    expect(retrieved?.title).toBe(doc.title);
  });
});
```

### 5.2 Integration Tests
```typescript
describe('Document Editor', () => {
  it('should auto-save changes', async () => {
    const { getByRole, findByText } = render(<DocumentEditor />);
    const editor = getByRole('textbox');
    
    fireEvent.change(editor, { target: { value: 'New content' } });
    
    // Wait for auto-save
    await findByText('Saved');
    
    const saved = await storage.get(documentId);
    expect(saved.content).toContain('New content');
  });
});
```