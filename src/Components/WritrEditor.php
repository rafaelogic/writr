<?php

namespace Rafaelogic\Writr\Components;

use Illuminate\View\Component;
use Illuminate\Support\Str;
use Rafaelogic\Writr\Services\AssetManager;
use Rafaelogic\Writr\Services\SettingsService;

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
    protected SettingsService $settingsService;

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
        $this->settingsService = app(SettingsService::class);
        
        $this->name = $name;
        $this->id = $id ?? 'writr-' . Str::random(8);
        $this->required = $required;
        $this->placeholder = $placeholder ?: $this->settingsService->getSettings()['editor']['placeholder'];
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
            $cssVariables = $data['cssVariables'];
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
<style>{{$cssVariables}}</style>
<div class="writr-editor-wrapper {$class}" data-writr-config='{$configJson}' data-writr-value='{$valueJson}'>
    <!-- Hidden input for form submission -->
    <input type="hidden" name="{$name}" id="{$id}-input" value='{$valueJson}' {$required} {$customAttrs} />
    
    <!-- Readonly Status Indicator -->
    <div id="{$id}-readonly-status" class="writr-readonly-status" style="display: none; background: #fef3c7; border: 1px solid #f59e0b; color: #92400e; padding: 8px 12px; border-radius: 6px; margin-bottom: 10px; font-size: 14px; font-weight: 500;">
        <svg style="width: 16px; height: 16px; display: inline-block; margin-right: 6px; vertical-align: text-bottom;" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
        </svg>
        Read-only mode: Content cannot be edited
    </div>
    
    <!-- Editor container -->
    <div id="{$id}" 
         class="writr-editor" 
         data-placeholder="{$placeholder}"
         data-readonly="{$readonly}"
         style="min-height: var(--writr-min-height, 300px); max-height: var(--writr-max-height, none); border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
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
        
        const configData = JSON.parse(document.querySelector('[data-writr-config]').getAttribute('data-writr-config'));
        const value = JSON.parse(document.querySelector('[data-writr-value]').getAttribute('data-writr-value'));
        
        // Build tools configuration as an array (as expected by EditorJS validator)
        const enabledTools = configData.enabledTools || ['header', 'paragraph', 'list', 'quote', 'code', 'table'];
        
        // Remove enabledTools from config since it's not a valid EditorJS option
        delete configData.enabledTools;
        
        const editor = window.Writr.create({
            holder: '{$id}',
            tools: enabledTools, // Pass as array, not object
            ...configData,
            data: value,
            onChange: function(api) {
                // Auto-save to hidden input
                api.saver.save().then(function(outputData) {
                    document.getElementById('{$id}-input').value = JSON.stringify(outputData);
                    
                    // Trigger change event for any listeners
                    document.getElementById('{$id}-input').dispatchEvent(new Event('change', { bubbles: true }));
                }).catch(function(error) {
                    console.error('Error saving editor content:', error);
                });
            }
        });
        
        // Store editor instance globally for access
        window['{$id}_editor'] = editor;
        window.currentEditor = editor; // Global reference for demo
        
        // Register with content capture handler when editor is ready
        if (editor.ready && editor.ready()) {
            // Editor is already ready
            if (window.writrContentCaptureHandler) {
                window.writrContentCaptureHandler.registerEditor('{$id}', editor, '{$id}-input');
            }
        } else {
            // Wait for editor to be ready using event listener
            editor.on('ready', function() {
                if (window.writrContentCaptureHandler) {
                    window.writrContentCaptureHandler.registerEditor('{$id}', editor, '{$id}-input');
                }
            });
        }
        
        // Update readonly status indicator
        function updateReadonlyStatus() {
            const statusElement = document.getElementById('{$id}-readonly-status');
            const editorElement = document.getElementById('{$id}');
            
            if (editor && editor.readOnly && editor.readOnly.isEnabled) {
                statusElement.style.display = 'block';
                editorElement.style.borderColor = '#f59e0b';
                editorElement.style.backgroundColor = '#fffbeb';
            } else {
                statusElement.style.display = 'none';
                editorElement.style.borderColor = '#e2e8f0';
                editorElement.style.backgroundColor = 'white';
            }
        }
        
        // Check readonly status after editor is ready
        function checkAndUpdateReadonlyStatus() {
            if (editor.ready && editor.ready()) {
                updateReadonlyStatus();
                
                // Monitor readonly state changes (if your app allows toggling)
                if (editor.readOnly && editor.readOnly.toggle) {
                    const originalToggle = editor.readOnly.toggle.bind(editor.readOnly);
                    editor.readOnly.toggle = function(state) {
                        const result = originalToggle(state);
                        setTimeout(updateReadonlyStatus, 100); // Small delay to ensure state is updated
                        return result;
                    };
                }
            } else {
                // Wait for editor to be ready
                editor.on('ready', function() {
                    updateReadonlyStatus();
                    
                    // Monitor readonly state changes (if your app allows toggling)
                    if (editor.readOnly && editor.readOnly.toggle) {
                        const originalToggle = editor.readOnly.toggle.bind(editor.readOnly);
                        editor.readOnly.toggle = function(state) {
                            const result = originalToggle(state);
                            setTimeout(updateReadonlyStatus, 100); // Small delay to ensure state is updated
                            return result;
                        };
                    }
                });
            }
        }
        
        checkAndUpdateReadonlyStatus();
        
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
            'configJson' => $this->settingsService->toJavaScriptConfig(),
            'valueJson' => json_encode($this->value),
            'cssVariables' => $this->settingsService->getCssVariables(),
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
        $settings = $this->settingsService->getSettings();
        
        return [
            'placeholder' => $this->placeholder,
            'autofocus' => $settings['editor']['autofocus'],
            'readOnly' => $this->readonly || $settings['editor']['readonly'],
            'minHeight' => $settings['editor']['min_height'],
            'maxHeight' => $settings['editor']['max_height'],
            'spellcheck' => $settings['editor']['spellcheck'],
            // Don't set tools here - let SettingsService handle it via toJavaScriptConfig()
            'features' => $settings['features'],
            'theme' => $settings['theme']['default'],
            'security' => $settings['security'],
            'performance' => $settings['performance'],
            'i18n' => [
                'direction' => 'ltr',
                'messages' => $this->getI18nMessages(),
            ],
        ];
    }

    /**
     * Get enabled tools from settings
     */
    protected function getEnabledTools(array $tools): array
    {
        $enabledTools = [];

        foreach ($tools as $tool => $settings) {
            if ($settings['enabled'] ?? false) {
                $enabledTools[] = $tool;
            }
        }

        // Default enabled tools if none configured
        return empty($enabledTools) ? ['header', 'paragraph', 'list', 'quote', 'code', 'table'] : $enabledTools;
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
