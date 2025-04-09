# .NB API Specification

## 1. Base Configuration
- Base URL: `/api/v1`
- Response Format: JSON
- Authentication: JWT (JSON Web Tokens)
- Rate Limiting: 100 requests per minute per user

## 2. Authentication Endpoints

### 2.1 User Authentication
```
POST /auth/register
- Request:
  {
    "username": string,
    "email": string,
    "password": string
  }
- Response: 201 Created
  {
    "user": {
      "id": string,
      "username": string,
      "email": string
    },
    "token": string
  }

POST /auth/login
- Request:
  {
    "email": string,
    "password": string
  }
- Response: 200 OK
  {
    "token": string,
    "user": UserObject
  }

POST /auth/logout
- Headers: Authorization: Bearer {token}
- Response: 200 OK
```

## 3. Notebook Endpoints

### 3.1 Notebook Management
```
GET /notebooks
- Headers: Authorization: Bearer {token}
- Query Parameters:
  - limit: number (default: 20)
  - offset: number (default: 0)
  - sort: string (default: "created_at")
- Response: 200 OK
  {
    "notebooks": [NotebookObject],
    "total": number,
    "hasMore": boolean
  }

POST /notebooks
- Headers: Authorization: Bearer {token}
- Request:
  {
    "name": string,
    "description": string,
    "is_secure": boolean,
    "encryption_key"?: string
  }
- Response: 201 Created
  {
    "notebook": NotebookObject
  }

GET /notebooks/:id
PUT /notebooks/:id
DELETE /notebooks/:id
```

## 4. Section & Subsection Endpoints

### 4.1 Section Operations
```
GET /notebooks/:notebookId/sections
POST /notebooks/:notebookId/sections
GET /sections/:id
PUT /sections/:id
DELETE /sections/:id
```

### 4.2 Subsection Operations
```
GET /sections/:sectionId/subsections
POST /sections/:sectionId/subsections
GET /subsections/:id
PUT /subsections/:id
DELETE /subsections/:id
```

## 5. Document Endpoints

### 5.1 Document Operations
```
GET /subsections/:subsectionId/documents
- Headers: Authorization: Bearer {token}
- Query Parameters:
  - limit: number
  - offset: number
  - sort: string
- Response: 200 OK
  {
    "documents": [DocumentObject],
    "total": number,
    "hasMore": boolean
  }

POST /subsections/:subsectionId/documents
- Headers: 
  - Authorization: Bearer {token}
  - Content-Type: application/json
- Request:
  {
    "title": string,
    "content": string,
    "metadata": {
      "tags": string[]
    }
  }
- Response: 201 Created
  {
    "document": DocumentObject
  }

GET /documents/:id
PUT /documents/:id
DELETE /documents/:id
```

### 5.2 Document Attachments
```
POST /documents/:id/attachments
- Headers: 
  - Authorization: Bearer {token}
  - Content-Type: multipart/form-data
- Request: FormData
- Response: 201 Created
  {
    "attachment": AttachmentObject
  }

DELETE /documents/:id/attachments/:attachmentId
```

## 6. Export/Import Endpoints

### 6.1 Export Operations
```
POST /export/notebook/:id
- Query Parameters:
  - format: "pdf" | "txt"
- Response: 200 OK
  - File download

POST /export/section/:id
POST /export/subsection/:id
POST /export/document/:id
```

### 6.2 Import Operations
```
POST /import/notebook
POST /import/section/:notebookId
POST /import/subsection/:sectionId
POST /import/document/:subsectionId
```

## 7. Search Endpoints
```
GET /search
- Query Parameters:
  - q: string
  - type: "notebook" | "section" | "subsection" | "document"
  - limit: number
  - offset: number
- Response: 200 OK
  {
    "results": [SearchResultObject],
    "total": number,
    "hasMore": boolean
  }
```

## 8. Sync Endpoints
```
POST /sync
- Request:
  {
    "changes": [ChangeObject],
    "lastSync": string (ISO date)
  }
- Response: 200 OK
  {
    "accepted": [string], // IDs of accepted changes
    "rejected": [string], // IDs of rejected changes
    "conflicts": [ConflictObject]
  }

GET /sync/status
- Response: 200 OK
  {
    "lastSync": string,
    "pendingChanges": number
  }
```

## 9. Error Responses
```
400 Bad Request
{
  "error": "ValidationError",
  "message": string,
  "details": Object
}

401 Unauthorized
{
  "error": "AuthenticationError",
  "message": string
}

403 Forbidden
{
  "error": "ForbiddenError",
  "message": string
}

404 Not Found
{
  "error": "NotFoundError",
  "message": string
}

429 Too Many Requests
{
  "error": "RateLimitError",
  "message": string,
  "retryAfter": number
}

500 Internal Server Error
{
  "error": "InternalError",
  "message": string
}
```