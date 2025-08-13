# API Reference

This document provides a complete reference for Writr's PHP and JavaScript APIs.

## 📋 Table of Contents

- [PHP API](#php-api)
  - [WritrService](#writrservice)
  - [AssetManager](#assetmanager)
  - [SettingsService](#settingsservice)
  - [Blade Component](#blade-component)
  - [Validation Rules](#validation-rules)
- [JavaScript API](#javascript-api)
  - [WritrEditor Class](#writreditor-class)
  - [Configuration Options](#configuration-options)
  - [Methods](#methods)
  - [Events](#events)
- [Configuration Reference](#configuration-reference)
- [Route Endpoints](#route-endpoints)

---

## PHP API

### WritrService

The main service class for processing Writr content.

#### Methods

##### `toHtml(array $content): string`

Converts Editor.js content to HTML.

```php
use Rafaelogic\Writr\Services\WritrService;

$writr = app(WritrService::class);
$content = json_decode($request->content, true);
$html = $writr->toHtml($content);
```

**Parameters:**
- `$content` (array): Editor.js content structure

**Returns:**
- `string`: HTML representation

**Example:**
```php
$content = [
    'blocks' => [
        [
            'type' => 'paragraph',
            'data' => ['text' => 'Hello World']
        ]
    ]
];
$html = $writr->toHtml($content); // Returns: <p>Hello World</p>
```

##### `toMarkdown(array $content): string`

Converts Editor.js content to Markdown.

```php
$markdown = $writr->toMarkdown($content);
```

**Parameters:**
- `$content` (array): Editor.js content structure

**Returns:**
- `string`: Markdown representation

##### `toText(array $content): string`

Extracts plain text from Editor.js content.

```php
$plainText = $writr->toText($content);
```

**Parameters:**
- `$content` (array): Editor.js content structure

**Returns:**
- `string`: Plain text content

##### `getContentStats(array $content): array`

Returns content statistics.

```php
$stats = $writr->getContentStats($content);
```

**Parameters:**
- `$content` (array): Editor.js content structure

**Returns:**
- `array`: Statistics with keys:
  - `words` (int): Word count
  - `characters` (int): Character count
  - `reading_time` (float): Estimated reading time in minutes

**Example:**
```php
$stats = $writr->getContentStats($content);
// Returns: ['words' => 245, 'characters' => 1428, 'reading_time' => 1.2]
```

##### `generateToc(array $content, int $maxDepth = 6): array`

Generates table of contents from headers.

```php
$toc = $writr->generateToc($content, 3); // Max depth of 3
```

**Parameters:**
- `$content` (array): Editor.js content structure
- `$maxDepth` (int): Maximum header depth to include

**Returns:**
- `array`: TOC structure with items containing:
  - `level` (int): Header level (1-6)
  - `text` (string): Header text
  - `anchor` (string): URL anchor
  - `children` (array): Nested headers

##### `sanitizeContent(array $content): array`

Sanitizes Editor.js content for security.

```php
$clean = $writr->sanitizeContent($content);
```

**Parameters:**
- `$content` (array): Raw Editor.js content

**Returns:**
- `array`: Sanitized content structure

##### `validateContent(array $content): bool`

Validates Editor.js content structure.

```php
$isValid = $writr->validateContent($content);
```

**Parameters:**
- `$content` (array): Editor.js content to validate

**Returns:**
- `bool`: True if content is valid

---

### AssetManager

Manages CSS and JavaScript assets for the editor.

#### Methods

##### `getStyles(): string`

Returns CSS styles for the editor.

```php
use Rafaelogic\Writr\Services\AssetManager;

$assetManager = app(AssetManager::class);
$css = $assetManager->getStyles();
```

**Returns:**
- `string`: CSS content or link tags

##### `getScripts(): string`

Returns JavaScript for the editor.

```php
$js = $assetManager->getScripts();
```

**Returns:**
- `string`: JavaScript content or script tags

##### `getVersion(): string`

Returns current asset version for cache busting.

```php
$version = $assetManager->getVersion();
```

**Returns:**
- `string`: Version string

---

### SettingsService

Manages configuration and settings.

#### Methods

##### `get(string $key, mixed $default = null): mixed`

Gets a configuration value.

```php
use Rafaelogic\Writr\Services\SettingsService;

$settings = app(SettingsService::class);
$placeholder = $settings->get('editor.placeholder', 'Start writing...');
```

**Parameters:**
- `$key` (string): Configuration key (dot notation)
- `$default` (mixed): Default value if key not found

**Returns:**
- `mixed`: Configuration value

##### `set(string $key, mixed $value): void`

Sets a configuration value.

```php
$settings->set('editor.autofocus', true);
```

**Parameters:**
- `$key` (string): Configuration key
- `$value` (mixed): Value to set

##### `all(): array`

Returns all configuration values.

```php
$config = $settings->all();
```

**Returns:**
- `array`: Complete configuration array

---

### Blade Component

The `<x-writr-editor />` component for embedding the editor.

#### Component Properties

```blade
<x-writr-editor 
    name="content"              {{-- Required: Form field name --}}
    id="editor-1"               {{-- Optional: Element ID --}}
    :value="$content"           {{-- Optional: Initial content --}}
    placeholder="Start..."      {{-- Optional: Placeholder text --}}
    :config="[]"                {{-- Optional: Editor configuration --}}
    :required="true"            {{-- Optional: Required field --}}
    class="min-h-96"            {{-- Optional: CSS classes --}}
    data-testid="editor"        {{-- Optional: Additional attributes --}}
/>
```

#### Property Details

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | string | Yes | - | Form field name |
| `id` | string | No | Auto-generated | Element ID |
| `value` | string/array | No | `''` | Initial content (JSON string or array) |
| `placeholder` | string | No | Config default | Placeholder text |
| `config` | array | No | `[]` | Editor configuration override |
| `required` | bool | No | `false` | HTML required attribute |
| `class` | string | No | `''` | Additional CSS classes |

#### Configuration Override

```blade
<x-writr-editor 
    name="content"
    :config="[
        'editor' => [
            'autofocus' => true,
            'readonly' => false,
        ],
        'tools' => [
            'header' => ['enabled' => true],
            'image' => ['enabled' => false],
        ],
        'features' => [
            'darkMode' => true,
            'wordCount' => true,
        ]
    ]"
/>
```

---

### Validation Rules

Custom Laravel validation rules for Writr content.

#### `writr_content`

Validates Editor.js content structure.

```php
$request->validate([
    'content' => ['required', 'writr_content'],
]);
```

**Usage Examples:**
```php
// Basic validation
$rules = ['content' => 'required|writr_content'];

// With custom message
$rules = ['content' => 'required|writr_content'];
$messages = ['content.writr_content' => 'Invalid editor content format.'];

// Combined with other rules
$rules = [
    'title' => 'required|string|max:255',
    'content' => 'required|writr_content|min:10',
];
```

---

## JavaScript API

### WritrEditor Class

The main JavaScript class for editor functionality.

#### Constructor

```javascript
import WritrEditor from './writr.js';

const editor = new WritrEditor(options);
```

#### Options Object

```javascript
const options = {
    // Required
    holder: 'editor-container',        // Element ID or HTMLElement
    
    // Content
    data: {                           // Initial content
        blocks: [],
        version: '2.24.3'
    },
    
    // Editor settings
    placeholder: 'Start writing...',   // Placeholder text
    autofocus: false,                 // Auto-focus on load
    readonly: false,                  // Read-only mode
    
    // Tools configuration
    tools: {
        header: {
            class: Header,
            config: {
                levels: [1, 2, 3, 4, 5, 6],
                defaultLevel: 2
            }
        },
        paragraph: {
            class: Paragraph,
            inlineToolbar: true
        },
        // ... other tools
    },
    
    // Features
    features: {
        darkMode: true,
        wordCount: true,
        autoSave: {
            enabled: true,
            interval: 30000,
            endpoint: '/api/autosave'
        }
    },
    
    // Event callbacks
    onChange: (data) => {
        console.log('Content changed', data);
    },
    onReady: () => {
        console.log('Editor ready');
    },
    onFocus: () => {
        console.log('Editor focused');
    },
    onBlur: () => {
        console.log('Editor blurred');
    }
};
```

### Methods

#### `save(): Promise<object>`

Saves and returns current editor content.

```javascript
editor.save().then(data => {
    console.log('Saved data:', data);
}).catch(error => {
    console.error('Save failed:', error);
});
```

**Returns:**
- `Promise<object>`: Editor.js content structure

#### `render(data: object): Promise<void>`

Renders content in the editor.

```javascript
const content = {
    blocks: [
        {
            type: 'paragraph',
            data: { text: 'Hello World' }
        }
    ]
};

editor.render(content).then(() => {
    console.log('Content rendered');
});
```

**Parameters:**
- `data` (object): Editor.js content structure

#### `clear(): void`

Clears all editor content.

```javascript
editor.clear();
```

#### `focus(): void`

Focuses the editor.

```javascript
editor.focus();
```

#### `blur(): void`

Removes focus from the editor.

```javascript
editor.blur();
```

#### `destroy(): void`

Destroys the editor instance and cleans up resources.

```javascript
editor.destroy();
```

#### `isReady(): boolean`

Checks if editor is ready.

```javascript
if (editor.isReady()) {
    // Editor is ready for operations
}
```

#### `getSelection(): object`

Gets current text selection.

```javascript
const selection = editor.getSelection();
console.log('Selection:', selection);
```

**Returns:**
- `object`: Selection information with start/end positions

### Events

#### Event Listener Methods

```javascript
// Add event listener
editor.on('change', (data) => {
    console.log('Content changed:', data);
});

// Remove event listener  
editor.off('change', handler);

// One-time event listener
editor.once('ready', () => {
    console.log('Editor ready - this will only fire once');
});
```

#### Available Events

| Event | Parameters | Description |
|-------|------------|-------------|
| `ready` | `()` | Editor is initialized and ready |
| `change` | `(data)` | Content has changed |
| `focus` | `()` | Editor gained focus |
| `blur` | `()` | Editor lost focus |
| `block-added` | `(block)` | New block was added |
| `block-removed` | `(block)` | Block was removed |
| `block-changed` | `(block)` | Block content changed |
| `tool-changed` | `(toolName)` | Active tool changed |
| `save` | `(data)` | Content was saved |
| `error` | `(error)` | An error occurred |

#### Event Examples

```javascript
// Auto-save on content changes
editor.on('change', debounce((data) => {
    localStorage.setItem('draft', JSON.stringify(data));
}, 1000));

// Track user engagement
editor.on('focus', () => {
    analytics.track('editor_focused');
});

// Handle errors
editor.on('error', (error) => {
    console.error('Editor error:', error);
    showNotification('Something went wrong', 'error');
});
```

---

## Configuration Reference

### Complete Configuration Structure

```php
// config/writr.php
return [
    // Editor settings
    'editor' => [
        'placeholder' => 'Start writing your story...',
        'autofocus' => false,
        'readonly' => false,
        'min_height' => 300,
        'max_height' => null,
        'spellcheck' => true,
    ],
    
    // Tools configuration
    'tools' => [
        'header' => [
            'enabled' => true,
            'config' => [
                'levels' => [1, 2, 3, 4, 5, 6],
                'defaultLevel' => 2,
                'allowAnchor' => true,
            ],
        ],
        'paragraph' => [
            'enabled' => true,
            'config' => [
                'preserveBlank' => false,
            ],
        ],
        'list' => [
            'enabled' => true,
            'config' => [
                'defaultStyle' => 'unordered',
            ],
        ],
        'image' => [
            'enabled' => true,
            'config' => [
                'endpoints' => [
                    'byFile' => '/writr/upload-image',
                    'byUrl' => '/writr/upload-url',
                ],
                'field' => 'image',
                'types' => 'image/*',
                'captionPlaceholder' => 'Enter caption...',
            ],
        ],
        'table' => [
            'enabled' => true,
            'config' => [
                'rows' => 2,
                'cols' => 3,
                'withHeadings' => true,
            ],
        ],
        'code' => [
            'enabled' => true,
            'config' => [
                'placeholder' => 'Enter code...',
            ],
        ],
        'quote' => [
            'enabled' => true,
            'config' => [
                'quotePlaceholder' => 'Enter quote...',
                'captionPlaceholder' => 'Enter caption...',
            ],
        ],
        'delimiter' => [
            'enabled' => true,
        ],
        'embed' => [
            'enabled' => true,
            'config' => [
                'services' => [
                    'youtube' => true,
                    'twitter' => true,
                    'instagram' => true,
                ],
            ],
        ],
        'raw' => [
            'enabled' => false, // Disabled by default for security
        ],
    ],
    
    // Features
    'features' => [
        'drag_drop' => true,
        'undo_redo' => true,
        'dark_mode' => [
            'enabled' => true,
            'default' => 'auto', // 'light', 'dark', 'auto'
            'storage_key' => 'writr-theme',
        ],
        'live_preview' => true,
        'table_of_contents' => [
            'enabled' => true,
            'levels' => [1, 2, 3, 4, 5, 6],
            'position' => 'right',
        ],
        'word_count' => [
            'enabled' => true,
            'position' => 'bottom',
            'show_characters' => true,
            'show_words' => true,
            'show_reading_time' => true,
        ],
        'auto_save' => [
            'enabled' => false,
            'interval' => 30000,
            'endpoint' => null,
            'debounce' => 1000,
        ],
    ],
    
    // Upload settings
    'uploads' => [
        'disk' => 'public',
        'path' => 'writr/uploads',
        'max_file_size' => 10 * 1024 * 1024,
        'allowed_extensions' => [
            'images' => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
            'documents' => ['pdf', 'doc', 'docx', 'txt', 'rtf'],
        ],
        'image_optimization' => [
            'enabled' => true,
            'quality' => 85,
            'max_width' => 1920,
            'max_height' => 1080,
        ],
    ],
    
    // Routes
    'routes' => [
        'enabled' => true,
        'prefix' => 'writr',
        'middleware' => ['web'],
    ],
    
    // Security
    'security' => [
        'sanitize_content' => true,
        'allowed_html_tags' => [
            'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'strong', 'em', 'u', 'a', 'ul', 'ol', 'li',
            'blockquote', 'code', 'pre', 'img', 'br',
        ],
        'csrf_protection' => true,
        'rate_limiting' => [
            'uploads' => '10,1',
            'api_calls' => '60,1',
        ],
    ],
    
    // Performance
    'performance' => [
        'lazy_load_tools' => true,
        'cache_assets' => true,
        'minify_output' => true,
        'debounce_delay' => 300,
    ],
];
```

---

## Route Endpoints

Writr provides several API endpoints:

### Upload Endpoints

#### `POST /writr/upload-image`

Upload image files.

**Parameters:**
- `image` (file): Image file
- `_token` (string): CSRF token

**Response:**
```json
{
    "success": 1,
    "file": {
        "url": "https://example.com/storage/image.jpg",
        "name": "image.jpg",
        "size": 12345,
        "caption": ""
    }
}
```

#### `POST /writr/upload-file`

Upload any file.

**Parameters:**
- `file` (file): File to upload
- `_token` (string): CSRF token

**Response:**
```json
{
    "success": 1,
    "file": {
        "url": "https://example.com/storage/document.pdf",
        "name": "document.pdf",
        "size": 54321,
        "extension": "pdf"
    }
}
```

### Utility Endpoints

#### `POST /writr/fetch-url`

Fetch URL metadata for embeds.

**Parameters:**
- `url` (string): URL to fetch

**Response:**
```json
{
    "success": 1,
    "meta": {
        "title": "Page Title",
        "description": "Page description",
        "image": {
            "url": "https://example.com/image.jpg"
        }
    }
}
```

#### `POST /writr/export`

Export content to different formats.

**Parameters:**
- `content` (string): JSON content
- `format` (string): 'html', 'markdown', 'text'

**Response:**
```json
{
    "success": true,
    "content": "<p>Exported content</p>",
    "format": "html"
}
```

### Settings Endpoints

#### `GET /writr/settings`

Display settings interface.

#### `POST /writr/settings`

Save settings configuration.

**Parameters:**
- Configuration object with settings

---

## Error Handling

### HTTP Error Responses

All endpoints return consistent error responses:

```json
{
    "success": 0,
    "error": {
        "code": "UPLOAD_FAILED",
        "message": "File upload failed",
        "details": "File too large"
    }
}
```

### Common Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `INVALID_FILE_TYPE` | File type not allowed | Check allowed extensions |
| `FILE_TOO_LARGE` | File exceeds size limit | Reduce file size |
| `UPLOAD_FAILED` | General upload error | Check server configuration |
| `INVALID_CONTENT` | Content validation failed | Check content structure |
| `CSRF_MISMATCH` | CSRF token invalid | Refresh page and retry |
| `RATE_LIMITED` | Too many requests | Wait and retry |

---

**Last Updated**: August 14, 2025  
**API Version**: 1.1.0
