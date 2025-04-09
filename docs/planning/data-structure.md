# 2. Data Structure & Management Responses

## 2.1 Storage Structure

### Document Size Limits
```typescript
const DOCUMENT_LIMITS = {
  maxSize: {
    regular: 5 * 1024 * 1024,    // 5MB for regular documents
    secure: 2 * 1024 * 1024      // 2MB for secure documents
  },
  maxDocuments: {
    perNotebook: 1000,
    perSection: 200,
    total: 5000
  },
  attachments: {
    maxSize: 10 * 1024 * 1024,   // 10MB per attachment
    maxCount: 10,                 // per document
    allowedTypes: new Set([
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'text/markdown'
    ])
  }
};
```

### Organization Structure
```typescript
interface NotebookStructure {
  notebook: {
    id: string;
    name: string;
    description?: string;
    isSecure: boolean;
    created: number;
    updated: number;
    metadata: NotebookMetadata;
  };
  sections: Section[];
  subsections: Subsection[];
  documents: Document[];
}

interface NotebookMetadata {
  documentCount: number;
  totalSize: number;
  lastAccessed: number;
  tags: string[];
  color?: string;
  icon?: string;
}

interface Section {
  id: string;
  notebookId: string;
  name: string;
  order: number;
  created: number;
  updated: number;
}

interface Subsection {
  id: string;
  sectionId: string;
  name: string;
  order: number;
  created: number;
  updated: number;
}

interface Document {
  id: string;
  subsectionId: string;
  title: string;
  content: JSONContent;
  created: number;
  updated: number;
  metadata: DocumentMetadata;
}

interface DocumentMetadata {
  wordCount: number;
  readTime: number;
  tags: string[];
  attachments: Attachment[];
  version: number;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  created: number;
}
```

## 2.2 Organization Implementation

### Hierarchy Management
```typescript
class HierarchyManager {
  private readonly MAX_DEPTH = 3; // Notebook > Section > Subsection
  
  async createSection(notebookId: string, name: string): Promise<Section> {
    const sections = await this.getSections(notebookId);
    if (sections.length >= DOCUMENT_LIMITS.maxDocuments.perSection) {
      throw new Error('Maximum sections limit reached');
    }

    const section: Section = {
      id: crypto.randomUUID(),
      notebookId,
      name,
      order: sections.length,
      created: Date.now(),
      updated: Date.now()
    };

    await this.saveSection(section);
    return section;
  }

  async moveDocument(
    documentId: string,
    targetSubsectionId: string
  ): Promise<void> {
    const doc = await this.getDocument(documentId);
    const targetSubsection = await this.getSubsection(targetSubsectionId);

    if (!doc || !targetSubsection) {
      throw new Error('Invalid document or target subsection');
    }

    const docsInTarget = await this.getDocuments(targetSubsectionId);
    if (docsInTarget.length >= DOCUMENT_LIMITS.maxDocuments.perSection) {
      throw new Error('Target subsection is full');
    }

    await this.updateDocument(documentId, {
      subsectionId: targetSubsectionId,
      updated: Date.now()
    });
  }
}
```

### Sorting and Organization
```typescript
class DocumentOrganizer {
  sortMethods = {
    byName: (a: Document, b: Document) => a.title.localeCompare(b.title),
    byDate: (a: Document, b: Document) => b.updated - a.updated,
    bySize: (a: Document, b: Document) => {
      const sizeA = this.calculateSize(a);
      const sizeB = this.calculateSize(b);
      return sizeB - sizeA;
    }
  };

  async organizeNotebook(notebookId: string): Promise<void> {
    const notebook = await this.getNotebook(notebookId);
    const sections = await this.getSections(notebookId);

    // Reorder sections
    for (let i = 0; i < sections.length; i++) {
      sections[i].order = i;
      await this.updateSection(sections[i].id, { order: i });
    }

    // Update notebook metadata
    const metadata = await this.calculateNotebookMetadata(notebookId);
    await this.updateNotebook(notebookId, { metadata });
  }

  private async calculateNotebookMetadata(
    notebookId: string
  ): Promise<NotebookMetadata> {
    const documents = await this.getAllNotebookDocuments(notebookId);
    
    return {
      documentCount: documents.length,
      totalSize: documents.reduce((sum, doc) => sum + this.calculateSize(doc), 0),
      lastAccessed: Date.now(),
      tags: this.extractUniqueTags(documents)
    };
  }
}
```

## 2.3 Document Versioning

### Version Control Implementation
```typescript
interface DocumentVersion {
  id: string;
  documentId: string;
  content: JSONContent;
  timestamp: number;
  version: number;
  changes: {
    added: number;
    removed: number;
  };
}

class VersionManager {
  private readonly MAX_VERSIONS = 10;

  async createVersion(
    documentId: string,
    content: JSONContent
  ): Promise<DocumentVersion> {
    const currentDoc = await this.getDocument(documentId);
    const versions = await this.getVersions(documentId);

    // Create new version
    const version: DocumentVersion = {
      id: crypto.randomUUID(),
      documentId,
      content,
      timestamp: Date.now(),
      version: currentDoc.metadata.version + 1,
      changes: this.calculateChanges(currentDoc.content, content)
    };

    // Maintain version limit
    if (versions.length >= this.MAX_VERSIONS) {
      await this.removeOldestVersion(documentId);
    }

    await this.saveVersion(version);
    return version;
  }

  async restoreVersion(
    documentId: string,
    versionId: string
  ): Promise<Document> {
    const version = await this.getVersion(versionId);
    if (!version || version.documentId !== documentId) {
      throw new Error('Invalid version');
    }

    const document = await this.getDocument(documentId);
    const restoredDoc = {
      ...document,
      content: version.content,
      metadata: {
        ...document.metadata,
        version: version.version
      },
      updated: Date.now()
    };

    await this.updateDocument(documentId, restoredDoc);
    return restoredDoc;
  }
}
```

Would you like me to:
1. Continue with Security & Privacy questions?
2. Add more implementation details to any section?
3. Include specific UI components for these features?

Let me know how you'd like to proceed!