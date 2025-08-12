<?php

namespace Rafaelogic\Writr\Services;

use Illuminate\Support\Facades\Cache;

class SettingsService
{
    /**
     * Get current settings (merged with defaults)
     */
    public function getSettings(): array
    {
        $defaults = $this->getDefaultSettings();
        $stored = Cache::get('writr.settings', []);
        
        return $this->mergeSettings($defaults, $stored);
    }

    /**
     * Save settings to cache
     */
    public function saveSettings(array $settings): void
    {
        // Convert flattened dot notation back to nested array if needed
        $nestedSettings = $this->unflattenSettings($settings);
        Cache::put('writr.settings', $nestedSettings, now()->addDays(30));
    }

    /**
     * Convert flattened dot notation back to nested array
     */
    private function unflattenSettings(array $flattened): array
    {
        $nested = [];
        
        foreach ($flattened as $key => $value) {
            // If key contains dots, it's flattened - convert to nested
            if (strpos($key, '.') !== false) {
                $keys = explode('.', $key);
                $current = &$nested;
                
                foreach ($keys as $k) {
                    if (!isset($current[$k])) {
                        $current[$k] = [];
                    }
                    if ($k === end($keys)) {
                        $current[$k] = $value;
                    } else {
                        $current = &$current[$k];
                    }
                }
            } else {
                // Key is not flattened, keep as is
                $nested[$key] = $value;
            }
        }
        
        return $nested;
    }

    /**
     * Reset settings to defaults
     */
    public function resetSettings(): void
    {
        Cache::forget('writr.settings');
    }

    /**
     * Import settings from array
     */
    public function importSettings(array $settings): void
    {
        // Validate and merge with defaults to ensure structure
        $defaults = $this->getDefaultSettings();
        $merged = $this->mergeSettings($defaults, $settings);
        $this->saveSettings($merged);
    }

    /**
     * Get default settings
     */
    public function getDefaultSettings(): array
    {
        return [
            'editor' => [
                'placeholder' => 'Start writing...',
                'autofocus' => false,
                'readonly' => false,
                'min_height' => 300,
                'max_height' => null,
                'spellcheck' => true,
            ],
            'tools' => [
                'header' => [
                    'enabled' => true,
                    'config' => [
                        'levels' => [1, 2, 3, 4, 5, 6],
                        'defaultLevel' => 2,
                        'allowAnchor' => true,
                    ]
                ],
                'paragraph' => [
                    'enabled' => true,
                    'config' => [
                        'preserveBlank' => false,
                    ]
                ],
                'list' => [
                    'enabled' => true,
                    'config' => [
                        'defaultStyle' => 'unordered',
                    ]
                ],
                'quote' => [
                    'enabled' => true,
                    'config' => [
                        'quotePlaceholder' => 'Enter a quote',
                        'captionPlaceholder' => 'Quote\'s author',
                    ]
                ],
                'code' => [
                    'enabled' => true,
                    'config' => [
                        'placeholder' => 'Enter code...',
                    ]
                ],
                'table' => [
                    'enabled' => true,
                    'config' => [
                        'rows' => 2,
                        'cols' => 3,
                    ]
                ],
                'image' => [
                    'enabled' => true,
                    'config' => [
                        'field' => 'image',
                        'types' => 'image/*',
                        'captionPlaceholder' => 'Caption',
                    ]
                ],
            ],
            'features' => [
                'darkMode' => true,
                'wordCount' => true,
                'tableOfContents' => true,
                'autoSave' => [
                    'enabled' => false,
                    'interval' => 30000,
                ],
                'export' => [
                    'enabled' => true,
                    'formats' => ['html', 'markdown', 'json'],
                ],
            ],
            'theme' => [
                'default' => 'light',
                'allowToggle' => true,
            ],
            'security' => [
                'sanitize' => true,
                'allowedTags' => 'p,br,strong,em,u,a,h1,h2,h3,h4,h5,h6,ul,ol,li,blockquote,code,pre',
                'maxBlocks' => 1000,
                'maxFileSize' => 10, // MB
            ],
            'performance' => [
                'lazyLoad' => true,
                'debounce' => 300,
                'cacheAssets' => true,
            ],
        ];
    }

    /**
     * Convert settings to JavaScript configuration
     */
    public function toJavaScriptConfig(): string
    {
        $settings = $this->getSettings();
        
        $jsConfig = [
            // Note: holder should be set by the component, not here
            'placeholder' => $settings['editor']['placeholder'],
            'autofocus' => $settings['editor']['autofocus'],
            'readOnly' => $settings['editor']['readonly'],
            'spellcheck' => $settings['editor']['spellcheck'],
            'minHeight' => $settings['editor']['min_height'],
            'maxHeight' => $settings['editor']['max_height'],
            // Remove tools config - let JavaScript handle this
            'enabledTools' => $this->getEnabledToolsList($settings['tools']),
            'i18n' => [
                'messages' => [
                    'ui' => [
                        'blockTunes' => [
                            'toggler' => [
                                'click_to_tune' => 'Click to tune',
                                'or_drag' => 'or drag to move'
                            ]
                        ],
                        'inlineToolbar' => [
                            'converter' => [
                                'convert_to' => 'Convert to'
                            ]
                        ],
                        'toolbar' => [
                            'toolbox' => [
                                'add' => 'Add'
                            ]
                        ]
                    ]
                ]
            ],
            'sanitizer' => $this->buildSanitizerConfig($settings['security']),
            'data' => [
                'blocks' => []
            ]
        ];

        return json_encode($jsConfig, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    }

    /**
     * Get CSS variables for theming
     */
    public function getCssVariables(): string
    {
        $settings = $this->getSettings();
        
        $css = ':root {';
        $css .= '--writr-min-height: ' . $settings['editor']['min_height'] . 'px;';
        
        if ($settings['editor']['max_height']) {
            $css .= '--writr-max-height: ' . $settings['editor']['max_height'] . 'px;';
        }
        
        $css .= '--writr-debounce: ' . $settings['performance']['debounce'] . 'ms;';
        $css .= '}';
        
        return $css;
    }

    /**
     * Get a simple list of enabled tools
     */
    private function getEnabledToolsList(array $tools): array
    {
        $enabledTools = [];
        
        foreach ($tools as $toolName => $toolSettings) {
            if ($toolSettings['enabled'] ?? false) {
                $enabledTools[] = $toolName;
            }
        }
        
        // Default enabled tools if none configured
        return empty($enabledTools) ? ['header', 'paragraph', 'list', 'quote', 'code', 'table'] : $enabledTools;
    }

    /**
     * Build tools configuration for Editor.js
     */
    private function buildToolsConfig(array $tools): array
    {
        $config = [];
        
        foreach ($tools as $toolName => $toolSettings) {
            if (!$toolSettings['enabled']) {
                continue;
            }
            
            switch ($toolName) {
                case 'header':
                    $config['header'] = [
                        'class' => 'Header',
                        'config' => [
                            'levels' => $toolSettings['config']['levels'],
                            'defaultLevel' => $toolSettings['config']['defaultLevel'],
                        ]
                    ];
                    break;
                    
                case 'paragraph':
                    $config['paragraph'] = [
                        'class' => 'Paragraph',
                        'inlineToolbar' => true,
                        'config' => [
                            'preserveBlank' => $toolSettings['config']['preserveBlank']
                        ]
                    ];
                    break;
                    
                case 'list':
                    $config['list'] = [
                        'class' => 'List',
                        'inlineToolbar' => true,
                        'config' => [
                            'defaultStyle' => $toolSettings['config']['defaultStyle']
                        ]
                    ];
                    break;
                    
                case 'quote':
                    $config['quote'] = [
                        'class' => 'Quote',
                        'inlineToolbar' => true,
                        'config' => [
                            'quotePlaceholder' => $toolSettings['config']['quotePlaceholder'],
                            'captionPlaceholder' => $toolSettings['config']['captionPlaceholder']
                        ]
                    ];
                    break;
                    
                case 'code':
                    $config['code'] = [
                        'class' => 'CodeTool',
                        'config' => [
                            'placeholder' => $toolSettings['config']['placeholder']
                        ]
                    ];
                    break;
                    
                case 'table':
                    $config['table'] = [
                        'class' => 'Table',
                        'inlineToolbar' => true,
                        'config' => [
                            'rows' => $toolSettings['config']['rows'],
                            'cols' => $toolSettings['config']['cols']
                        ]
                    ];
                    break;
                    
                case 'image':
                    $config['image'] = [
                        'class' => 'ImageTool',
                        'config' => [
                            'endpoints' => [
                                'byFile' => '/writr/upload-image',
                                'byUrl' => '/writr/fetch-image'
                            ],
                            'field' => $toolSettings['config']['field'],
                            'types' => $toolSettings['config']['types'],
                            'captionPlaceholder' => $toolSettings['config']['captionPlaceholder']
                        ]
                    ];
                    break;
            }
        }
        
        return $config;
    }

    /**
     * Build sanitizer configuration
     */
    private function buildSanitizerConfig(array $security): array
    {
        if (!$security['sanitize']) {
            return [];
        }
        
        $allowedTags = explode(',', $security['allowedTags']);
        $config = [];
        
        foreach ($allowedTags as $tag) {
            $tag = trim($tag);
            $config[$tag] = true;
        }
        
        return $config;
    }

    /**
     * Recursively merge settings arrays
     */
    private function mergeSettings(array $defaults, array $stored): array
    {
        foreach ($stored as $key => $value) {
            if (is_array($value) && isset($defaults[$key]) && is_array($defaults[$key])) {
                $defaults[$key] = $this->mergeSettings($defaults[$key], $value);
            } else {
                $defaults[$key] = $value;
            }
        }
        
        return $defaults;
    }
}
