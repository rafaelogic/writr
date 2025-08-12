# Writr - Laravel Notion-like Editor Package

![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)
![Laravel](https://img.shields.io/badge/Laravel-10%2B%20%7C%2011%20%7C%2012-red.svg)
![PHP](https://img.shields.io/badge/PHP-8.1%2B-purple.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A production-ready, comprehensive Notion-like editor for Laravel applications using Editor.js. Features a complete block-based editing experience with advanced tools, file handling, and seamless Laravel integration.

## 🌐 Live Demo

**[Try the Interactive Demo →](https://rafaelogic.github.io/writr/)**

Experience all features of Writr Editor including:
- All block types and inline formatting tools
- Real-time content capture and form submission
- Content export in multiple formats (HTML, Markdown, JSON)
- Professional inline toolbar with modern design
- Mobile-responsive editing interface

## ✨ Features

### 📝 Core Editor Capabilities
- ✅ **Complete Editor.js Integration**: All standard tools (headers, paragraphs, lists, tables, images, code blocks, quotes, embeds)
- ✅ **Drag & Drop Reordering**: Intuitive block reorganization with visual feedback
- ✅ **Undo/Redo System**: Full undo stack with keyboard shortcuts (Ctrl+Z / Ctrl+Y)
- ✅ **Live Preview Mode**: Toggle between edit and rendered preview
- ✅ **Dark/Light Themes**: Built-in theme system with automatic system detection
- ✅ **Mobile Responsive**: Optimized touch interface for all device sizes
- ✅ **Keyboard Shortcuts**: Full keyboard navigation and editing support

### 🚀 Advanced Features
- ✅ **Enhanced Inline Toolbar**: Modern inline toolbar with bottom positioning for text formatting
- ✅ **Content Capture System**: Automatic content capture for seamless form submissions
- ✅ **Settings UI**: Professional settings interface for all configuration options
- ✅ **Auto-save**: Configurable automatic content saving with debouncing
- ✅ **Table of Contents**: Auto-generated navigation from document headers
- ✅ **Word & Character Count**: Real-time statistics display
- ✅ **Content Export**: HTML, Markdown, Plain Text, and JSON export formats
- ✅ **Content Import**: Import from HTML, Markdown, and plain text sources
- ✅ **File Upload System**: Drag-and-drop image and file uploads with validation
- ✅ **Memory Management**: Intelligent cleanup to prevent memory leaks
- ✅ **Performance Monitoring**: Built-in performance tracking and optimization

### 🔧 Laravel Integration
- ✅ **Blade Component**: Drop-in `<x-writr-editor />` component with self-contained rendering
- ✅ **Form Integration**: Seamless Laravel form integration with validation rules
- ✅ **Asset Management**: Optimized asset bundling and cache-busting
- ✅ **Service Provider**: Auto-discovery with comprehensive configuration
- ✅ **Middleware Support**: Built-in CSRF protection and rate limiting
- ✅ **Queue Integration**: Background processing for heavy operations

### 🏗️ Architecture & Development
- ✅ **Modern JavaScript**: ES6+ modules with tree-shaking and optimization
- ✅ **Build System**: Laravel Mix + Webpack with development and production configurations
- ✅ **Zero Global Dependencies**: All dependencies bundled, no pollution of global scope
- ✅ **TypeScript Support**: Full type definitions and IntelliSense support
- ✅ **Testing Suite**: Comprehensive unit and integration tests (PHPUnit + Vitest)
- ✅ **Security Hardened**: Content sanitization, CSRF protection, and input validation

## 📦 Installation

### Requirements

- **PHP**: 8.1 or higher
- **Laravel**: 10.x, 11.x, or 12.x
- **Node.js**: 16+ (for asset compilation)
- **Modern Browser**: Chrome 70+, Firefox 65+, Safari 12+, Edge 79+

### 1. Install via Composer

```bash
composer require rafaelogic/writr
```

The package will auto-register via Laravel's package discovery.

### 2. Publish Assets (Optional)

```bash
# Publish configuration file (recommended for customization)
php artisan vendor:publish --tag=writr-config

# Publish all Blade views (rarely needed)
php artisan vendor:publish --tag=writr-views

# Publish compiled assets (CSS/JS) to public directory
php artisan vendor:publish --tag=writr-assets

# Publish all package files
php artisan vendor:publish --provider="Rafaelogic\Writr\WritrServiceProvider"
```

> **Note:** The Writr component is self-contained and renders directly from PHP for maximum compatibility. Publishing is typically only needed for configuration changes.

### 3. Setup Layout

Include required dependencies in your layout:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    <!-- Writr Styles -->
    @stack('writr-styles')
</head>
<body>
    <!-- Your content -->
    
    <!-- Writr Scripts -->
    @stack('writr-scripts')
</body>
</html>
```

## 🚀 Quick Start

### Basic Usage

The simplest way to get started:

```blade
{{-- In your Blade template --}}
<form action="/save-document" method="POST">
    @csrf
    
    <x-writr-editor 
        name="content" 
        :value="old('content', $document->content ?? '')"
        placeholder="Start writing your amazing content..."
    />
    
    <button type="submit" class="btn btn-primary">Save Document</button>
</form>
```

### With Laravel Validation

```php
// In your Controller
public function store(Request $request)
{
    $validated = $request->validate([
        'title' => 'required|string|max:255',
        'content' => 'required|json' // Writr content is stored as JSON
    ]);
    
    // Optionally validate the structure
    $contentData = json_decode($validated['content'], true);
    if (!isset($contentData['blocks']) || empty($contentData['blocks'])) {
        return back()->withErrors(['content' => 'Content cannot be empty.']);
    }
    
    Document::create($validated);
    
    return redirect()->route('documents.index')
        ->with('success', 'Document saved successfully!');
}
```

### Advanced Configuration

```blade
<x-writr-editor 
    name="content"
    id="advanced-editor"
    :value="$document->content"
    :config="[
        'placeholder' => 'Start your masterpiece...',
        'autofocus' => true,
        'features' => [
            'darkMode' => true,
            'wordCount' => true,
            'tableOfContents' => true,
            'autoSave' => [
                'enabled' => true,
                'interval' => 10000, // 10 seconds
                'endpoint' => route('documents.autosave', $document)
            ]
        ],
        'tools' => [
            'embed' => false,        // Disable embeds
            'raw' => false,          // Disable raw HTML
            'warning' => true,       // Enable warning blocks
        ]
    ]"
    class="min-h-96 border rounded-lg"
    required
/>
```

### Component Architecture

The Writr Blade component uses **self-contained PHP rendering** for maximum compatibility and reliability. Unlike traditional Blade templates, the component renders its HTML, CSS, and JavaScript directly from the PHP class to ensure:

- ✅ **Zero dependency conflicts** - No conflicts with your app's Blade directives or CSS frameworks
- ✅ **Consistent rendering** - Same output across all Laravel versions and configurations  
- ✅ **Automatic asset management** - CSS and JS assets are loaded automatically without manual setup
- ✅ **Framework agnostic** - Works with any CSS framework (Tailwind, Bootstrap, etc.)

This approach ensures the editor works out-of-the-box without requiring publishing or customization for most use cases.

## ⚙️ Configuration

The configuration file provides extensive customization options. You can manage settings in two ways:

### 🎨 Settings UI (Recommended)

Access the visual settings interface at `/writr/settings` for an intuitive configuration experience:

- **Professional Interface**: Modern, responsive settings UI with dark mode support
- **Live Validation**: Real-time input validation with helpful error messages  
- **Import/Export**: Backup and restore settings as JSON files
- **Keyboard Shortcuts**: Ctrl+S to save, Ctrl+Shift+R to reset
- **Organized Sections**: Editor, Tools, Features, Theme, Security, and Performance settings

```bash
# Visit in your browser
https://yourapp.com/writr/settings
```

### 📄 Configuration File

For programmatic or advanced configuration, publish the config file:

```bash
php artisan vendor:publish --tag=writr-config
```

### Editor Settings

```php
// config/writr.php
'editor' => [
    'placeholder' => 'Start writing your story...',
    'autofocus' => false,
    'readonly' => false,
    'min_height' => 300,
    'max_height' => null,
    'spellcheck' => true,
],
```

### Tools Configuration

Each tool can be enabled/disabled and configured:

```php
'tools' => [
    'header' => [
        'enabled' => true,
        'config' => [
            'levels' => [1, 2, 3, 4, 5, 6],
            'defaultLevel' => 2,
            'allowAnchor' => true,
        ],
    ],
    'image' => [
        'enabled' => true,
        'config' => [
            'endpoints' => [
                'byFile' => route('writr.upload.image'),
                'byUrl' => route('writr.upload.url'),
            ],
            'additionalRequestData' => [
                '_token' => csrf_token(),
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
    // ... more tools
],
```

### Feature Configuration

```php
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
        'position' => 'right', // 'left', 'right', 'top'
    ],
    'word_count' => [
        'enabled' => true,
        'position' => 'bottom', // 'top', 'bottom'
        'show_characters' => true,
        'show_words' => true,
        'show_reading_time' => true,
    ],
    'auto_save' => [
        'enabled' => false,
        'interval' => 30000, // 30 seconds
        'endpoint' => null,
        'debounce' => 1000,
    ],
],
```

## 📁 File Upload System

### Upload Configuration

```php
// config/writr.php
'uploads' => [
    'disk' => 'public',
    'path' => 'writr/uploads',
    'max_file_size' => 10 * 1024 * 1024, // 10MB
    'allowed_extensions' => [
        'images' => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
        'documents' => ['pdf', 'doc', 'docx', 'txt', 'rtf'],
        'archives' => ['zip', 'rar', '7z'],
    ],
    'image_optimization' => [
        'enabled' => true,
        'quality' => 85,
        'max_width' => 1920,
        'max_height' => 1080,
    ],
],
```

### Custom Upload Handler

Create your own upload endpoint:

```php
// routes/web.php
Route::post('/custom-upload', [CustomUploadController::class, 'handle'])
    ->name('custom.upload')
    ->middleware(['auth', 'throttle:60,1']);

// CustomUploadController.php
public function handle(Request $request)
{
    $request->validate([
        'image' => 'required|image|max:10240', // 10MB
    ]);
    
    $file = $request->file('image');
    
    // Custom processing (resize, watermark, etc.)
    $processedImage = $this->processImage($file);
    
    $path = $processedImage->store('custom-uploads', 'public');
    
    return response()->json([
        'success' => 1,
        'file' => [
            'url' => Storage::url($path),
            'name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'caption' => '',
        ]
    ]);
}
```

### Upload Progress & Validation

```blade
<x-writr-editor 
    name="content"
    :config="[
        'uploads' => [
            'progress_callback' => 'uploadProgress',
            'validation' => [
                'max_size' => '5MB',
                'allowed_types' => ['image/jpeg', 'image/png'],
                'required_dimensions' => ['min_width' => 300, 'min_height' => 200]
            ]
        ]
    ]"
/>

<script>
function uploadProgress(percentComplete) {
    console.log('Upload progress:', percentComplete + '%');
    // Update progress bar, etc.
}
</script>
```

## 🔄 Content Processing

### Working with Content

Writr stores content as JSON. Use the included service for processing:

```php
use Rafaelogic\Writr\Services\WritrService;

class DocumentController extends Controller
{
    public function __construct(
        private WritrService $writr
    ) {}
    
    public function show(Document $document)
    {
        $content = json_decode($document->content, true);
        
        // Convert to HTML for display
        $html = $this->writr->toHtml($content);
        
        // Convert to Markdown
        $markdown = $this->writr->toMarkdown($content);
        
        // Extract plain text (for search, etc.)
        $plainText = $this->writr->toText($content);
        
        // Get word count and reading time
        $stats = $this->writr->getContentStats($content);
        // Returns: ['words' => 245, 'characters' => 1428, 'reading_time' => 1.2]
        
        // Generate table of contents
        $toc = $this->writr->generateToc($content);
        
        return view('documents.show', [
            'document' => $document,
            'html' => $html,
            'stats' => $stats,
            'toc' => $toc,
        ]);
    }
}
```

### Content Validation

```php
// Custom validation rule
$request->validate([
    'content' => [
        'required',
        'json',
        function ($attribute, $value, $fail) {
            $data = json_decode($value, true);
            
            // Validate structure
            if (!isset($data['blocks']) || !is_array($data['blocks'])) {
                $fail('Invalid content structure.');
            }
            
            // Validate content is not empty
            if (empty($data['blocks'])) {
                $fail('Content cannot be empty.');
            }
            
            // Validate each block
            foreach ($data['blocks'] as $block) {
                if (!isset($block['type']) || !isset($block['data'])) {
                    $fail('Invalid block structure.');
                }
            }
        }
    ]
]);
```

### Search Integration

```php
// Make content searchable
class Document extends Model
{
    protected $casts = [
        'content' => 'array',
    ];
    
    // Accessor for search indexing
    public function getSearchableContentAttribute()
    {
        return app(WritrService::class)->toText($this->content);
    }
    
    // Scope for searching
    public function scopeSearch($query, $term)
    {
        return $query->whereRaw(
            "JSON_UNQUOTE(JSON_EXTRACT(content, '$.blocks[*].data.text')) LIKE ?",
            ["%{$term}%"]
        );
    }
}
```

## Advanced Features

### Auto-save

```blade
<x-writr-editor 
    name="content"
    :config="[
        'autoSave' => [
            'enabled' => true,
            'interval' => 5000, // 5 seconds
            'endpoint' => '/custom-auto-save'
        ]
    ]"
/>
```

### Dark Mode

```blade
<x-writr-editor 
    name="content"
    :config="[
        'theme' => [
            'default' => 'dark',
            'allowToggle' => true
        ]
    ]"
/>
```

### Custom Styling

```php
// config/writr.php
'theme' => [
    'css_variables' => [
        '--writr-primary-color' => '#your-color',
        '--writr-bg-color' => '#your-bg-color',
    ],
],
```

## API Endpoints

The package provides several API endpoints for editor functionality:

- `POST /writr/upload-image` - Upload images
- `POST /writr/upload-file` - Upload files
- `POST /writr/fetch-url` - Fetch URL metadata
- `POST /writr/preview` - Generate content preview
- `POST /writr/export` - Export content
- `POST /writr/auto-save` - Auto-save content

## 🎨 Frontend Integration

### Direct JavaScript Usage

For advanced customization, use the JavaScript API directly:

```javascript
import WritrEditor from './vendor/writr/js/writr.esm.js';

// Initialize editor
const editor = new WritrEditor({
    holder: 'editor-container',
    data: {
        blocks: []
    },
    tools: {
        // Custom tool configuration
    },
    features: {
        darkMode: true,
        autoSave: {
            enabled: true,
            interval: 15000,
            endpoint: '/api/auto-save'
        }
    },
    onChange: (data) => {
        console.log('Content changed:', data);
        // Handle changes
    },
    onReady: () => {
        console.log('Editor is ready');
    }
});

// Editor methods
editor.save().then(data => {
    console.log('Saved data:', data);
});

editor.clear();
editor.render(newData);
editor.focus();
```

### Custom Tools

Create your own Editor.js tools:

```javascript
// CustomAlertTool.js
class CustomAlertTool {
    static get toolbox() {
        return {
            title: 'Alert',
            icon: '<svg>...</svg>'
        };
    }
    
    constructor({ data, api }) {
        this.data = data;
        this.api = api;
        this.wrapper = undefined;
    }
    
    render() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('custom-alert');
        
        const input = document.createElement('input');
        input.placeholder = 'Enter alert message...';
        input.value = this.data.text || '';
        input.addEventListener('input', (e) => {
            this.data.text = e.target.value;
        });
        
        this.wrapper.appendChild(input);
        return this.wrapper;
    }
    
    save() {
        return {
            text: this.data.text || '',
            level: this.data.level || 'info'
        };
    }
    
    validate(savedData) {
        return savedData.text && savedData.text.trim() !== '';
    }
}

// Register tool
const editor = new WritrEditor({
    tools: {
        alert: CustomAlertTool
    }
});
```

### Event Handling

```javascript
// Listen to editor events
editor.on('change', (data) => {
    // Content changed
    localStorage.setItem('draft', JSON.stringify(data));
});

editor.on('focus', () => {
    // Editor focused
    document.body.classList.add('editor-focused');
});

editor.on('blur', () => {
    // Editor lost focus
    document.body.classList.remove('editor-focused');
});

editor.on('tool-change', (toolName) => {
    // Active tool changed
    console.log('Active tool:', toolName);
});
```

## 🏗️ Development & Building

### Development Setup

```bash
# Clone or install the package
composer require rafaelogic/writr

# Install frontend dependencies
cd vendor/rafaelogic/writr  # or your package directory
npm install

# Start development server
npm run dev

# Watch for changes
npm run watch
```

### Building Assets

```bash
# Development build (with source maps)
npm run development

# Production build (optimized, minified)
npm run production

# Bundle build (standalone distribution)
npm run bundle
```

### Testing

```bash
# Run PHP tests
composer test

# Run with coverage
composer test-coverage

# Run JavaScript tests
npm test

# Watch mode for JS tests
npm run test:watch

# Lint code
npm run lint
npm run lint:fix
```

### Project Structure

```
writr/
├── config/writr.php              # Configuration file
├── src/                          # PHP source code
│   ├── WritrServiceProvider.php  # Service provider
│   ├── Components/               # Blade components
│   ├── Http/Controllers/         # Controllers
│   └── Services/                # Services
├── resources/
│   ├── js/                      # JavaScript source
│   │   ├── writr.js            # Main entry point
│   │   ├── editor/             # Editor modules
│   │   ├── tools/              # Custom tools
│   │   └── utils/              # Utilities
│   ├── css/writr.css           # Compiled CSS
│   ├── sass/writr.scss         # Sass source
│   └── views/                  # Blade templates
├── public/                     # Compiled assets
│   ├── js/writr.js            # Main bundle
│   ├── js/writr.min.js        # Minified bundle
│   ├── css/writr.css          # Compiled CSS
│   └── css/writr.min.css      # Minified CSS
└── tests/                     # Test files
    ├── Feature/               # Feature tests
    ├── Unit/                  # Unit tests
    └── frontend/              # JS tests
```

## 🚀 Performance & Optimization

### Performance Features

- **Lazy Loading**: Tools and features load on-demand
- **Code Splitting**: Optimized bundle splitting for faster initial load
- **Memory Management**: Automatic cleanup prevents memory leaks
- **Debounced Events**: Auto-save and change events are intelligently debounced
- **Asset Optimization**: CSS/JS minification and compression
- **Caching**: Browser caching with versioning for static assets

### Optimization Tips

```php
// config/writr.php - Production settings
'performance' => [
    'lazy_load_tools' => true,
    'cache_assets' => true,
    'minify_output' => true,
    'debounce_delay' => 300,
    'memory_monitoring' => env('APP_ENV') === 'local',
],

// Image optimization
'uploads' => [
    'image_optimization' => [
        'enabled' => true,
        'quality' => 85,
        'progressive' => true,
        'strip_metadata' => true,
    ],
],
```

### Memory Management

```javascript
// Automatic memory cleanup
const editor = new WritrEditor({
    features: {
        memoryMonitoring: true, // Monitor memory usage
        autoCleanup: true,      // Automatic cleanup
        maxMemoryUsage: 50      // Max memory in MB
    }
});

// Manual cleanup
editor.destroy(); // Clean up when done
```

### Bundle Analysis

```bash
# Analyze bundle size
npm run bundle -- --analyze

# Check performance
npm run lighthouse
```

## 🌍 Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 70+     | ✅ Full Support |
| Firefox | 65+     | ✅ Full Support |
| Safari  | 12+     | ✅ Full Support |
| Edge    | 79+     | ✅ Full Support |
| Opera   | 57+     | ✅ Full Support |
| Mobile Safari | 12+ | ✅ Full Support |
| Chrome Mobile | 70+ | ✅ Full Support |

### Polyfills

For older browsers, include polyfills:

```html
<!-- For IE11 and older browsers -->
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/writr.git
   cd writr
   ```

2. **Install Dependencies**
   ```bash
   composer install
   npm install
   ```

3. **Set Up Testing Environment**
   ```bash
   cd tests/TestApp
   composer install
   npm install
   ```

4. **Run Tests**
   ```bash
   # PHP tests
   composer test
   
   # JavaScript tests
   npm test
   
   # Full test suite
   npm run test:all
   ```

### Contribution Guidelines

- **Code Style**: Follow PSR-12 for PHP, ESLint rules for JavaScript
- **Tests**: Add tests for new features and bug fixes
- **Documentation**: Update README and relevant docs
- **Commit Messages**: Use conventional commit format
- **Pull Requests**: Target the `develop` branch

### Development Workflow

1. Create a feature branch from `develop`
2. Make your changes with tests
3. Run the full test suite
4. Update documentation if needed
5. Submit a pull request

### Areas for Contribution

- 🔧 **New Tools**: Create custom Editor.js tools
- 🎨 **Themes**: Design new editor themes
- 🌐 **Translations**: Add internationalization support
- 📚 **Documentation**: Improve guides and examples
- 🐛 **Bug Fixes**: Resolve issues and edge cases
- ⚡ **Performance**: Optimize loading and runtime performance

## 📄 License

This package is open-sourced software licensed under the [MIT license](LICENSE).

### Third-party Licenses

- [Editor.js](https://editorjs.io/) - Apache 2.0 License
- [Laravel](https://laravel.com/) - MIT License
- [Tailwind CSS](https://tailwindcss.com/) - MIT License

## 🆘 Support & Community

### Documentation & Resources

- 📖 **[Full Documentation](https://writr.dev/docs)** - Comprehensive guides and API reference
- 🎯 **[Demo & Examples](demo.html)** - Interactive demo with all features
- 📚 **[API Reference](https://writr.dev/api)** - Complete API documentation
- 🏗️ **[Integration Guide](https://writr.dev/integration)** - Step-by-step Laravel integration

### Getting Help

- 🐛 **[GitHub Issues](https://github.com/rafaelogic/writr/issues)** - Bug reports and feature requests
- 💬 **[Discussions](https://github.com/rafaelogic/writr/discussions)** - Community support and Q&A
- 📧 **Email Support**: support@writr.dev
- � **Twitter**: [@WritrEditor](https://twitter.com/WritrEditor)

### Community

- 🌟 **Star the repository** if you find it useful
- 🔄 **Share with others** who might benefit
- 🤝 **Contribute** improvements and new features
- 📝 **Write tutorials** and share your experience

## 🙏 Credits & Acknowledgments

### Core Technologies

- **[Editor.js](https://editorjs.io/)** - The amazing block-style editor framework
- **[Laravel](https://laravel.com/)** - The elegant PHP framework  
- **[Tailwind CSS](https://tailwindcss.com/)** - The utility-first CSS framework

### Special Thanks

- The Editor.js team for creating such a flexible and powerful editor
- The Laravel community for continuous inspiration and feedback
- All contributors who help make Writr better
- Early adopters and testers who provided valuable feedback

---

<div align="center">

**Made with ❤️ for the Laravel community**

[Website](https://writr.dev) • [Documentation](https://writr.dev/docs) • [Demo](demo.html) • [GitHub](https://github.com/rafaelogic/writr)

</div>
