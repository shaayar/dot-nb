# Import/Export Feature Specification

## 1. Supported Formats

### 1.1 Format Configuration
```typescript
const SUPPORTED_FORMATS = {
  import: {
    documents: ['pdf', 'txt'],
    notebooks: ['.nb'],
    sections: ['.sec']
  },
  export: {
    documents: ['pdf', 'txt'],
    notebooks: ['.nb'],
    sections: ['.sec'],
    subsections: ['.sec']
  }
};

interface ExportOptions {
  format: string;
  includeMetadata: boolean;
  compression: boolean;
}
```

## 2. Implementation

### 2.1 Export Implementation
```typescript
class ExportManager {
  async exportNotebook(
    notebookId: string, 
    options: ExportOptions
  ): Promise<Blob> {
    const notebook = await this.getNotebook(notebookId);
    const sections = await this.getNotebookSections(notebookId);
    const documents = await this.getNotebookDocuments(notebookId);

    const exportData = {
      notebook,
      sections,
      documents,
      metadata: options.includeMetadata ? await this.getMetadata(notebookId) : undefined
    };

    if (options.compression) {
      return this.compressAndPackage(exportData);
    }

    return new Blob([JSON.stringify(exportData)], { 
      type: 'application/x-notebook' 
    });
  }

  async exportSection(
    sectionId: string, 
    options: ExportOptions
  ): Promise<Blob> {
    // Similar implementation for section export
  }

  async exportDocument(
    documentId: string,
    format: 'pdf' | 'txt'
  ): Promise<Blob> {
    const document = await this.getDocument(documentId);
    return this.convertToFormat(document, format);
  }
}
```

### 2.2 Import Implementation
```typescript
class ImportManager {
  async importNotebook(file: File): Promise<string> {
    const content = await this.readFile(file);
    const data = this.isCompressed(content) 
      ? await this.decompressContent(content)
      : JSON.parse(content);

    // Validate structure
    this.validateNotebookStructure(data);

    // Import
    return this.createNotebook(data);
  }

  async importDocument(
    file: File, 
    targetNotebookId: string
  ): Promise<string> {
    const content = await this.readFile(file);
    const format = this.getFileFormat(file);
    
    const document = await this.convertToDocument(content, format);
    return this.saveDocument(document, targetNotebookId);
  }

  private async convertToDocument(
    content: string, 
    format: string
  ): Promise<Document> {
    switch (format) {
      case 'pdf':
        return this.convertPdfToDocument(content);
      case 'txt':
        return this.convertTxtToDocument(content);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
}
```

## 3. Conflict Resolution

### 3.1 Conflict Handler
```typescript
interface ConflictResolution {
  strategy: 'keep-existing' | 'overwrite' | 'merge' | 'create-new';
  mergeStrategy?: 'manual' | 'auto';
}

class ConflictHandler {
  async resolveConflict(
    existing: any,
    imported: any,
    resolution: ConflictResolution
  ): Promise<any> {
    switch (resolution.strategy) {
      case 'keep-existing':
        return existing;
      case 'overwrite':
        return imported;
      case 'merge':
        return this.mergeContent(existing, imported, resolution.mergeStrategy);
      case 'create-new':
        return this.createNewVersion(imported);
      default:
        throw new Error(`Invalid resolution strategy: ${resolution.strategy}`);
    }
  }

  private async mergeContent(
    existing: any,
    imported: any,
    strategy: 'manual' | 'auto' = 'auto'
  ): Promise<any> {
    if (strategy === 'manual') {
      return this.showMergeUI(existing, imported);
    }
    
    return this.autoMerge(existing, imported);
  }
}
```