<?php

namespace Rafaelogic\Writr\Components;

use Illuminate\View\Component;
use Illuminate\Support\Str;
use Rafaelogic\Writr\Services\AssetManager;

class WritrEditor extends Component
{
    public string $name;
    public string $id;
    public mixed $value;
    public array $config;
    public bool $required;
    public string $placeholder;
    public bool $readonly;
    public ?string $class;
    public array $customAttributes;

    /**
     * Create a new component instance.
     */
    public function __construct(
        string $name = 'content',
        ?string $id = null,
        mixed $value = null,
        array $config = [],
        bool $required = false,
        string $placeholder = '',
        bool $readonly = false,
        ?string $class = null,
        array $attributes = []
    ) {
        $this->name = $name;
        $this->id = $id ?? 'writr-' . Str::random(8);
        $this->required = $required;
        $this->placeholder = $placeholder ?: config('writr.editor.placeholder', 'Start writing...');
        $this->readonly = $readonly;
        $this->class = $class;
        $this->customAttributes = $attributes;
        
        // Now that all properties are set, we can prepare value and config
        $this->value = $this->prepareValue($value);
        $this->config = array_merge($this->getDefaultConfig(), $config);
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render()
    {
        return function (array $data) {
            $assetUrls = $data['assetUrls'];
            $configJson = htmlspecialchars($data['configJson'], ENT_QUOTES, 'UTF-8');
            $valueJson = htmlspecialchars($data['valueJson'], ENT_QUOTES, 'UTF-8');
            $id = htmlspecialchars($data['id'], ENT_QUOTES, 'UTF-8');
            $name = htmlspecialchars($data['name'], ENT_QUOTES, 'UTF-8');
            $class = htmlspecialchars($data['class'] ?? '', ENT_QUOTES, 'UTF-8');
            $placeholder = htmlspecialchars($data['placeholder'], ENT_QUOTES, 'UTF-8');
            $required = $data['required'] ? 'required' : '';
            $readonly = $data['readonly'] ? 'readonly' : '';
            
            $customAttrs = '';
            foreach ($data['customAttributes'] as $key => $value) {
                $customAttrs .= sprintf(' %s="%s"', 
                    htmlspecialchars($key, ENT_QUOTES, 'UTF-8'),
                    htmlspecialchars($value, ENT_QUOTES, 'UTF-8')
                );
            }

            return <<<HTML
<!-- Writr Editor Component -->
<div class="writr-editor-wrapper {$class}" data-writr-config='{$configJson}' data-writr-value='{$valueJson}'>
    <!-- Hidden input for form submission -->
    <input type="hidden" name="{$name}" id="{$id}-input" value='{$valueJson}' {$required} {$customAttrs} />
    
    <!-- Editor container -->
    <div id="{$id}" 
         class="writr-editor" 
         data-placeholder="{$placeholder}"
         data-readonly="{$readonly}"
         style="min-height: 300px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
    </div>
</div>

<!-- Auto-include assets if not already loaded -->
<script>
(function() {
    if (window.WritrAssetsLoaded) return;
    window.WritrAssetsLoaded = true;
    
    // Load CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = '{$assetUrls['css']}';
    document.head.appendChild(cssLink);
    
    // Load JS
    const script = document.createElement('script');
    script.type = 'module';
    script.src = '{$assetUrls['js']}';
    script.onload = function() {
        // Initialize editor when assets are loaded
        if (window.Writr) {
            window.WritrAutoInit = window.WritrAutoInit || [];
            window.WritrAutoInit.push('{$id}');
        }
    };
    document.head.appendChild(script);
})();
</script>

<script>
// Auto-initialization script for this specific editor instance
document.addEventListener('DOMContentLoaded', function() {
    const initEditor = function() {
        if (!window.Writr) {
            setTimeout(initEditor, 100);
            return;
        }
        
        const config = JSON.parse(document.querySelector('[data-writr-config]').getAttribute('data-writr-config'));
        const value = JSON.parse(document.querySelector('[data-writr-value]').getAttribute('data-writr-value'));
        
        const editor = window.Writr.create({
            holder: '{$id}',
            ...config,
            data: value,
            onChange: function(api) {
                // Auto-save to hidden input
                api.saver.save().then(function(outputData) {
                    document.getElementById('{$id}-input').value = JSON.stringify(outputData);
                });
            }
        });
        
        // Store editor instance globally for access
        window['{$id}_editor'] = editor;
        window.currentEditor = editor; // Global reference for demo
        
        // Emit editor ready event
        window.dispatchEvent(new CustomEvent('writrEditorReady', {
            detail: { editor, id: '{$id}' }
        }));
    };
    
    initEditor();
});
</script>
HTML;
        };
    }

    /**
     * Get the component data.
     */
    public function data(): array
    {
        return [
            'name' => $this->name,
            'id' => $this->id,
            'value' => $this->value,
            'config' => $this->config,
            'required' => $this->required,
            'placeholder' => $this->placeholder,
            'readonly' => $this->readonly,
            'class' => $this->class,
            'customAttributes' => $this->customAttributes,
            'assetUrls' => $this->getAssetUrls(),
            'configJson' => json_encode($this->config),
            'valueJson' => json_encode($this->value),
        ];
    }

    /**
     * Prepare the value for the editor.
     */
    protected function prepareValue(mixed $value): array
    {
        if (empty($value)) {
            return [
                'time' => time(),
                'blocks' => [],
                'version' => '2.28.2'
            ];
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE && isset($decoded['blocks'])) {
                return $decoded;
            }
            
            // Convert plain text to blocks
            return [
                'time' => time(),
                'blocks' => [
                    [
                        'id' => Str::random(10),
                        'type' => 'paragraph',
                        'data' => ['text' => $value]
                    ]
                ],
                'version' => '2.28.2'
            ];
        }

        if (is_array($value)) {
            return $value;
        }

        return [
            'time' => time(),
            'blocks' => [],
            'version' => '2.28.2'
        ];
    }

    /**
     * Get default configuration.
     */
    protected function getDefaultConfig(): array
    {
        $tools = config('writr.tools', []);
        $enabledTools = [];

        foreach ($tools as $tool => $settings) {
            if ($settings['enabled'] ?? false) {
                $enabledTools[] = $tool; // Convert to simple array of tool names
            }
        }

        // Default enabled tools if none configured
        $defaultTools = [
            'header',
            'paragraph', 
            'list',
            'quote',
            'code',
            'table'
        ];

        return [
            'placeholder' => $this->placeholder,
            'autofocus' => config('writr.editor.autofocus', false),
            'readOnly' => $this->readonly,
            'minHeight' => config('writr.editor.min_height', 300),
            'tools' => empty($enabledTools) ? $defaultTools : $enabledTools,
            'features' => config('writr.features', []),
            'theme' => config('writr.theme.default', 'light'),
            'i18n' => [
                'direction' => 'ltr',
                'messages' => $this->getI18nMessages(),
            ],
        ];
    }

    /**
     * Get asset URLs.
     */
    protected function getAssetUrls(): array
    {
        $assetManager = app(AssetManager::class);
        
        return [
            'js' => $assetManager->getJsUrl(),
            'bundle' => $assetManager->getBundleUrl(),
            'css' => $assetManager->getCssUrl(),
        ];
    }

    /**
     * Get internationalization messages.
     */
    protected function getI18nMessages(): array
    {
        return [
            'ui' => [
                'blockTunes' => [
                    'toggler' => [
                        'clickToTune' => __('Click to tune'),
                        'orDragToMove' => __('or drag to move'),
                    ],
                ],
                'inlineToolbar' => [
                    'converter' => [
                        'convertTo' => __('Convert to'),
                    ],
                ],
                'toolbar' => [
                    'toolbox' => [
                        'add' => __('Add'),
                        'filter' => __('Filter'),
                        'nothingFound' => __('Nothing found'),
                    ],
                ],
                'popover' => [
                    'filter' => __('Filter'),
                    'nothingFound' => __('Nothing found'),
                ],
            ],
            'toolNames' => [
                'text' => __('Text'),
                'heading' => __('Heading'),
                'list' => __('List'),
                'warning' => __('Warning'),
                'checklist' => __('Checklist'),
                'quote' => __('Quote'),
                'code' => __('Code'),
                'delimiter' => __('Delimiter'),
                'table' => __('Table'),
                'link' => __('Link'),
                'marker' => __('Marker'),
                'bold' => __('Bold'),
                'italic' => __('Italic'),
                'inlineCode' => __('Inline Code'),
                'underline' => __('Underline'),
            ],
            'tools' => [
                'warning' => [
                    'title' => __('Title'),
                    'message' => __('Message'),
                ],
                'link' => [
                    'addLink' => __('Add a link'),
                ],
                'stub' => [
                    'theBlockCannotBeDisplayedCorrectly' => __('The block cannot be displayed correctly.'),
                ],
            ],
            'blockTunes' => [
                'delete' => [
                    'delete' => __('Delete'),
                    'clickToDelete' => __('Click to delete'),
                ],
                'moveUp' => [
                    'moveUp' => __('Move up'),
                ],
                'moveDown' => [
                    'moveDown' => __('Move down'),
                ],
            ],
        ];
    }
}
