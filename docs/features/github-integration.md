# GitHub Integration Specification

## 1. Configuration

### 1.1 GitHub Setup
```typescript
interface GitHubConfig {
  enabled: boolean;
  autoSync: boolean;
  syncInterval: number;
  maxRetries: number;
  repoConfig: {
    private: boolean;
    description: string;
    defaultBranch: string;
  };
}

const GITHUB_CONFIG: GitHubConfig = {
  enabled: true,
  autoSync: true,
  syncInterval: 300000, // 5 minutes
  maxRetries: 3,
  repoConfig: {
    private: true,
    description: 'DotNB Notebook Backup',
    defaultBranch: 'main'
  }
};
```

## 2. Implementation

### 2.1 GitHub Service
```typescript
class GitHubService {
  private octokit: Octokit;
  private repoName: string;

  constructor(token: string, repoName: string) {
    this.octokit = new Octokit({ auth: token });
    this.repoName = repoName;
  }

  async initializeRepo(): Promise<void> {
    try {
      await this.octokit.repos.createForAuthenticatedUser({
        name: this.repoName,
        private: GITHUB_CONFIG.repoConfig.private,
        description: GITHUB_CONFIG.repoConfig.description,
        auto_init: true
      });
    } catch (error) {
      throw new Error(`Failed to initialize repository: ${error.message}`);
    }
  }

  async syncNotebook(notebook: Notebook): Promise<void> {
    const content = await this.prepareContent(notebook);
    const path = `notebooks/${notebook.id}/content.json`;

    try {
      await this.commitFile(path, content);
    } catch (error) {
      throw new Error(`Failed to sync notebook: ${error.message}`);
    }
  }

  private async commitFile(
    path: string, 
    content: string
  ): Promise<void> {
    try {
      // Get current file (if exists)
      const current = await this.getCurrentFile(path);

      // Create or update file
      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.octokit.auth.username,
        repo: this.repoName,
        path,
        message: `Update ${path}`,
        content: Buffer.from(content).toString('base64'),
        sha: current?.sha
      });
    } catch (error) {
      throw new Error(`Failed to commit file: ${error.message}`);
    }
  }

  private async getCurrentFile(path: string) {
    try {
      const response = await this.octokit.repos.getContent({
        owner: this.octokit.auth.username,
        repo: this.repoName,
        path
      });

      return {
        sha: response.data.sha,
        content: Buffer.from(response.data.content, 'base64').toString()
      };
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }
}
```

### 2.2 Sync Manager
```typescript
class SyncManager {
  private githubService: GitHubService;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor(githubService: GitHubService) {
    this.githubService = githubService;
  }

  startAutoSync(): void {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(
      () => this.sync(),
      GITHUB_CONFIG.syncInterval
    );
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async sync(): Promise<void> {
    const notebooks = await this.getModifiedNotebooks();
    
    for (const notebook of notebooks) {
      try {
        await this.githubService.syncNotebook(notebook);
        await this.updateSyncStatus(notebook.id, true);
      } catch (error) {
        console.error(`Failed to sync notebook ${notebook.id}:`, error);
        await this.updateSyncStatus(notebook.id, false);
      }
    }
  }

  private async getModifiedNotebooks(): Promise<Notebook[]> {
    // Implementation to get modified notebooks
    return [];
  }

  private async updateSyncStatus(
    notebookId: string, 
    success: boolean
  ): Promise<void> {
    // Implementation to update sync status
  }
}
```

## 3. Error Handling

### 3.1 Retry Mechanism
```typescript
class RetryManager {
  private readonly maxRetries = GITHUB_CONFIG.maxRetries;

  async withRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        await this.wait(this.getBackoffTime(attempt));
      }
    }

    throw new Error(
      `Failed ${context} after ${this.maxRetries} attempts: ${lastError.message}`
    );
  }

  private getBackoffTime(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt - 1), 10000);
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```