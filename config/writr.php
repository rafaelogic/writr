<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Writr Editor Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the configuration options for the Writr editor package.
    | You can customize various aspects of the editor behavior and appearance.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Editor Settings
    |--------------------------------------------------------------------------
    */
    'editor' => [
        'placeholder' => 'Start writing...',
        'autofocus' => false,
        'readonly' => false,
        'min_height' => 300,
        'max_height' => null,
        'toolbar' => [
            'sticky' => true,
            'position' => 'top', // top, bottom, inline
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Tools Configuration
    |--------------------------------------------------------------------------
    |
    | Configure which Editor.js tools are available and their settings.
    |
    */
    'tools' => [
        'paragraph' => [
            'enabled' => true,
            'config' => [
                'placeholder' => 'Enter text...',
                'preserveBlank' => false,
            ],
        ],
        'header' => [
            'enabled' => true,
            'config' => [
                'placeholder' => 'Enter a header',
                'levels' => [1, 2, 3, 4, 5, 6],
                'defaultLevel' => 2,
            ],
        ],
        'list' => [
            'enabled' => true,
            'config' => [
                'defaultStyle' => 'unordered',
            ],
        ],
        'checklist' => [
            'enabled' => true,
        ],
        'quote' => [
            'enabled' => true,
            'config' => [
                'quotePlaceholder' => 'Enter a quote',
                'captionPlaceholder' => 'Quote\'s author',
            ],
        ],
        'code' => [
            'enabled' => true,
            'config' => [
                'placeholder' => 'Enter code...',
            ],
        ],
        'delimiter' => [
            'enabled' => true,
        ],
        'table' => [
            'enabled' => true,
            'config' => [
                'rows' => 2,
                'cols' => 3,
            ],
        ],
        'link' => [
            'enabled' => true,
            'config' => [
                'endpoint' => '/writr/fetch-url',
            ],
        ],
        'warning' => [
            'enabled' => true,
            'config' => [
                'titlePlaceholder' => 'Title',
                'messagePlaceholder' => 'Message',
            ],
        ],
        'marker' => [
            'enabled' => true,
        ],
        'inlineCode' => [
            'enabled' => true,
        ],
        'embed' => [
            'enabled' => true,
            'config' => [
                'services' => [
                    'youtube' => true,
                    'twitter' => true,
                    'codepen' => true,
                    'instagram' => true,
                ],
            ],
        ],
        'image' => [
            'enabled' => true,
            'config' => [
                'endpoints' => [
                    'byFile' => '/writr/upload-image',
                    'byUrl' => '/writr/fetch-image',
                ],
                'field' => 'image',
                'types' => 'image/*',
                'captionPlaceholder' => 'Caption',
                'buttonContent' => 'Select an Image',
                'uploader' => [
                    'url' => '/writr/upload-image',
                ],
            ],
        ],
        'raw' => [
            'enabled' => false,
        ],
        'attaches' => [
            'enabled' => true,
            'config' => [
                'endpoint' => '/writr/upload-file',
                'field' => 'file',
                'types' => '*',
                'buttonText' => 'Select file to upload',
                'errorMessage' => 'File upload failed',
            ],
        ],
        'underline' => [
            'enabled' => true,
        ],
        'nestedList' => [
            'enabled' => true,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Features Configuration
    |--------------------------------------------------------------------------
    */
    'features' => [
        'drag_drop' => true,
        'undo_redo' => true,
        'collaboration' => false,
        'comments' => false,
        'version_history' => false,
        'dark_mode' => true,
        'live_preview' => true,
        'table_of_contents' => true,
        'word_count' => true,
        'auto_save' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Auto Save Configuration
    |--------------------------------------------------------------------------
    */
    'auto_save' => [
        'enabled' => true,
        'interval' => 5000, // milliseconds
        'endpoint' => '/writr/auto-save',
    ],

    /*
    |--------------------------------------------------------------------------
    | Collaboration Settings
    |--------------------------------------------------------------------------
    */
    'collaboration' => [
        'enabled' => false,
        'websocket_endpoint' => env('WRITR_WEBSOCKET_ENDPOINT'),
        'room_prefix' => 'writr_',
        'presence_timeout' => 30, // seconds
    ],

    /*
    |--------------------------------------------------------------------------
    | File Upload Settings
    |--------------------------------------------------------------------------
    */
    'uploads' => [
        'disk' => env('WRITR_UPLOAD_DISK', 'public'),
        'path' => 'writr',
        'max_file_size' => 10 * 1024 * 1024, // 10MB in bytes
        'allowed_extensions' => [
            'images' => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
            'documents' => ['pdf', 'doc', 'docx', 'txt', 'rtf'],
            'archives' => ['zip', 'rar', '7z'],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Theme and Styling
    |--------------------------------------------------------------------------
    */
    'theme' => [
        'default' => 'light', // light, dark, auto
        'custom_css' => false,
        'tailwind_prefix' => 'writr-',
        'css_variables' => [
            '--writr-primary-color' => '#3b82f6',
            '--writr-bg-color' => '#ffffff',
            '--writr-text-color' => '#1f2937',
            '--writr-border-color' => '#e5e7eb',
            '--writr-focus-color' => '#60a5fa',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Performance Settings
    |--------------------------------------------------------------------------
    */
    'performance' => [
        'lazy_load_tools' => true,
        'debounce_delay' => 300,
        'chunk_size' => 1000, // for large documents
        'cache_assets' => true,
        'minify_output' => env('APP_ENV') === 'production',
    ],

    /*
    |--------------------------------------------------------------------------
    | Routes Configuration
    |--------------------------------------------------------------------------
    */
    'routes' => [
        'enabled' => true,
        'prefix' => 'writr',
        'middleware' => ['web'],
        'name_prefix' => 'writr.',
    ],

    /*
    |--------------------------------------------------------------------------
    | Security Settings
    |--------------------------------------------------------------------------
    */
    'security' => [
        'sanitize_html' => true,
        'allowed_html_tags' => [
            'p', 'br', 'strong', 'em', 'u', 'strike', 'code',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li',
            'blockquote', 'pre',
            'a', 'img',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
        ],
        'csrf_protection' => true,
        'rate_limiting' => [
            'uploads' => '60,1', // 60 uploads per minute
            'auto_save' => '120,1', // 120 auto-saves per minute
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Export Settings
    |--------------------------------------------------------------------------
    */
    'export' => [
        'formats' => [
            'html' => true,
            'markdown' => true,
            'json' => true,
            'pdf' => false, // Requires additional setup
        ],
        'templates' => [
            'html' => 'writr::exports.html',
            'markdown' => 'writr::exports.markdown',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Localization
    |--------------------------------------------------------------------------
    */
    'localization' => [
        'default_locale' => 'en',
        'available_locales' => ['en', 'es', 'fr', 'de'],
        'fallback_locale' => 'en',
    ],
];
