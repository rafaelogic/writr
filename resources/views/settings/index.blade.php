<!DOCTYPE html>
<html lang="en" x-data="{ darkMode: localStorage.getItem('darkMode') === 'true' }" x-bind:class="{ 'dark': darkMode }">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Writr Settings</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <style>
        [x-cloak] { display: none !important; }
    </style>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: {
                            50: '#f0f9ff',
                            500: '#3b82f6',
                            600: '#2563eb',
                            700: '#1d4ed8',
                        }
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50 dark:bg-gray-900 min-h-screen" x-cloak>
    <div x-data="settingsApp()" class="container mx-auto px-4 py-8 max-w-6xl">
        <!-- Header -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
            <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Writr Settings</h1>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Configure your editor preferences and features</p>
                    </div>
                    <div class="flex items-center space-x-3">
                        <!-- Dark Mode Toggle -->
                        <button @click="darkMode = !darkMode; localStorage.setItem('darkMode', darkMode)" 
                                class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <svg x-show="!darkMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                            </svg>
                            <svg x-show="darkMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                            </svg>
                        </button>
                        
                        <!-- Actions Dropdown -->
                        <div class="relative" x-data="{ open: false }">
                            <button @click="open = !open" class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2">
                                <span>Actions</span>
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>
                            <div x-show="open" @click.away="open = false" x-transition class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                                <a href="#" @click="exportSettings()" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg">Export Settings</a>
                                <label class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                    Import Settings
                                    <input type="file" @change="importSettings($event)" accept=".json" class="hidden">
                                </label>
                                <a href="#" @click="resetSettings()" class="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg">Reset to Defaults</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Notifications -->
        <div x-show="notification.show" x-transition class="mb-6">
            <div class="rounded-lg p-4 border" 
                 :class="notification.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200' : 
                         notification.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200' : 
                         'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'">
                <div class="flex items-center">
                    <svg x-show="notification.type === 'success'" class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                    <svg x-show="notification.type === 'error'" class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                    </svg>
                    <span x-text="notification.message"></span>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <!-- Sidebar Navigation -->
            <div class="lg:col-span-1">
                <nav class="space-y-2">
                    <template x-for="(section, key) in sections" :key="key">
                        <button @click="activeSection = key" 
                                class="w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3"
                                :class="activeSection === key ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'">
                            <span x-html="section.icon" class="w-5 h-5"></span>
                            <span x-text="section.title" class="font-medium"></span>
                        </button>
                    </template>
                </nav>
            </div>

            <!-- Settings Content -->
            <div class="lg:col-span-3">
                <form @submit.prevent="saveSettings()">
                    <!-- Editor Settings -->
                    <div x-show="activeSection === 'editor'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Editor Settings</h2>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Configure basic editor behavior and appearance</p>
                        </div>
                        <div class="p-6 space-y-6">
                            <!-- Placeholder -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Placeholder Text</label>
                                <input type="text" x-model="settings.editor.placeholder" 
                                       @input="console.log('Placeholder changed to:', $event.target.value, 'Settings object:', settings.editor.placeholder)"
                                       class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                            </div>

                            <!-- Height Settings -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Minimum Height (px)</label>
                                    <input type="number" x-model="settings.editor.min_height" min="100" max="2000"
                                           class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Maximum Height (px)</label>
                                    <input type="number" x-model="settings.editor.max_height" min="200" max="5000"
                                           class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                           placeholder="No limit">
                                </div>
                            </div>

                            <!-- Boolean Options -->
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Auto Focus</label>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">Focus editor on load</p>
                                    </div>
                                    <button type="button" @click="settings.editor.autofocus = !settings.editor.autofocus" 
                                            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                            :class="settings.editor.autofocus ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'">
                                        <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                              :class="settings.editor.autofocus ? 'translate-x-6' : 'translate-x-1'"></span>
                                    </button>
                                </div>

                                <div class="flex items-center justify-between">
                                    <div>
                                        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Read Only</label>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">Disable editing</p>
                                    </div>
                                    <button type="button" @click="settings.editor.readonly = !settings.editor.readonly" 
                                            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                            :class="settings.editor.readonly ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'">
                                        <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                              :class="settings.editor.readonly ? 'translate-x-6' : 'translate-x-1'"></span>
                                    </button>
                                </div>

                                <div class="flex items-center justify-between">
                                    <div>
                                        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Spell Check</label>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">Enable spell checking</p>
                                    </div>
                                    <button type="button" @click="settings.editor.spellcheck = !settings.editor.spellcheck" 
                                            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                            :class="settings.editor.spellcheck ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'">
                                        <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                              :class="settings.editor.spellcheck ? 'translate-x-6' : 'translate-x-1'"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tools Settings -->
                    <div x-show="activeSection === 'tools'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Editor Tools</h2>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Enable or disable tools and configure their behavior</p>
                        </div>
                        <div class="p-6 space-y-8">
                            <template x-for="(tool, toolKey) in settings.tools" :key="toolKey">
                                <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                    <div class="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 class="text-sm font-semibold text-gray-900 dark:text-white capitalize" x-text="toolKey"></h3>
                                            <p class="text-xs text-gray-500 dark:text-gray-400" x-text="getToolDescription(toolKey)"></p>
                                        </div>
                                        <button type="button" @click="tool.enabled = !tool.enabled" 
                                                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                                :class="tool.enabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'">
                                            <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                                  :class="tool.enabled ? 'translate-x-6' : 'translate-x-1'"></span>
                                        </button>
                                    </div>

                                    <!-- Tool-specific configurations -->
                                    <div x-show="tool.enabled && tool.config" class="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-600">
                                        <!-- Header Tool Config -->
                                        <template x-if="toolKey === 'header'">
                                            <div class="space-y-3">
                                                <div>
                                                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Available Levels</label>
                                                    <div class="flex space-x-2">
                                                        <template x-for="level in [1,2,3,4,5,6]" :key="level">
                                                            <button type="button" @click="toggleHeaderLevel(level)"
                                                                    class="px-3 py-1 text-xs rounded border transition-colors"
                                                                    :class="tool.config.levels.includes(level) ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300' : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'">
                                                                H<span x-text="level"></span>
                                                            </button>
                                                        </template>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Default Level</label>
                                                    <select x-model="tool.config.defaultLevel" class="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                                        <template x-for="level in tool.config.levels" :key="level">
                                                            <option :value="level" x-text="`H${level}`"></option>
                                                        </template>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Allow Anchor Links</label>
                                                    <button type="button" @click="tool.config.allowAnchor = !tool.config.allowAnchor" 
                                                            class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                                                            :class="tool.config.allowAnchor ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'">
                                                        <span class="inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200"
                                                              :class="tool.config.allowAnchor ? 'translate-x-5' : 'translate-x-1'"></span>
                                                    </button>
                                                </div>
                                            </div>
                                        </template>

                                        <!-- Paragraph Tool Config -->
                                        <template x-if="toolKey === 'paragraph'">
                                            <div>
                                                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Preserve Blank Lines</label>
                                                <button type="button" @click="tool.config.preserveBlank = !tool.config.preserveBlank" 
                                                        class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                                                        :class="tool.config.preserveBlank ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'">
                                                    <span class="inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200"
                                                          :class="tool.config.preserveBlank ? 'translate-x-5' : 'translate-x-1'"></span>
                                                </button>
                                            </div>
                                        </template>

                                        <!-- List Tool Config -->
                                        <template x-if="toolKey === 'list'">
                                            <div>
                                                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Default Style</label>
                                                <select x-model="tool.config.defaultStyle" class="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                                    <option value="unordered">Bullets</option>
                                                    <option value="ordered">Numbers</option>
                                                </select>
                                            </div>
                                        </template>

                                        <!-- Table Tool Config -->
                                        <template x-if="toolKey === 'table'">
                                            <div class="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Default Rows</label>
                                                    <input type="number" x-model="tool.config.rows" min="1" max="20" 
                                                           class="text-sm w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                                </div>
                                                <div>
                                                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Default Columns</label>
                                                    <input type="number" x-model="tool.config.cols" min="1" max="20" 
                                                           class="text-sm w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                                </div>
                                            </div>
                                        </template>

                                        <!-- Quote Tool Config -->
                                        <template x-if="toolKey === 'quote'">
                                            <div class="space-y-3">
                                                <div>
                                                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Quote Placeholder</label>
                                                    <input type="text" x-model="tool.config.quotePlaceholder" 
                                                           class="text-sm w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                                </div>
                                                <div>
                                                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Caption Placeholder</label>
                                                    <input type="text" x-model="tool.config.captionPlaceholder" 
                                                           class="text-sm w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                                </div>
                                            </div>
                                        </template>

                                        <!-- Code Tool Config -->
                                        <template x-if="toolKey === 'code'">
                                            <div>
                                                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Code Placeholder</label>
                                                <input type="text" x-model="tool.config.placeholder" 
                                                       class="text-sm w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                            </div>
                                        </template>

                                        <!-- Image Tool Config -->
                                        <template x-if="toolKey === 'image'">
                                            <div class="space-y-3">
                                                <div>
                                                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Field Name</label>
                                                    <input type="text" x-model="tool.config.field" 
                                                           class="text-sm w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                                </div>
                                                <div>
                                                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Accepted Types</label>
                                                    <input type="text" x-model="tool.config.types" placeholder="image/*" 
                                                           class="text-sm w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                                </div>
                                                <div>
                                                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Caption Placeholder</label>
                                                    <input type="text" x-model="tool.config.captionPlaceholder" 
                                                           class="text-sm w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                                </div>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>

                    <!-- Features Settings -->
                    <div x-show="activeSection === 'features'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Advanced Features</h2>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Configure additional editor features and capabilities</p>
                        </div>
                        <div class="p-6 space-y-6">
                            <!-- Feature Toggles -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</label>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">Enable dark theme support</p>
                                    </div>
                                    <button type="button" @click="settings.features.darkMode = !settings.features.darkMode" 
                                            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                            :class="settings.features.darkMode ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'">
                                        <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                              :class="settings.features.darkMode ? 'translate-x-6' : 'translate-x-1'"></span>
                                    </button>
                                </div>

                                <div class="flex items-center justify-between">
                                    <div>
                                        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Word Count</label>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">Show word count</p>
                                    </div>
                                    <button type="button" @click="settings.features.wordCount = !settings.features.wordCount" 
                                            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                            :class="settings.features.wordCount ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'">
                                        <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                              :class="settings.features.wordCount ? 'translate-x-6' : 'translate-x-1'"></span>
                                    </button>
                                </div>

                                <div class="flex items-center justify-between">
                                    <div>
                                        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Table of Contents</label>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">Generate TOC from headers</p>
                                    </div>
                                    <button type="button" @click="settings.features.tableOfContents = !settings.features.tableOfContents" 
                                            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                            :class="settings.features.tableOfContents ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'">
                                        <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                              :class="settings.features.tableOfContents ? 'translate-x-6' : 'translate-x-1'"></span>
                                    </button>
                                </div>

                                <div class="flex items-center justify-between">
                                    <div>
                                        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Export Features</label>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">Enable content export</p>
                                    </div>
                                    <button type="button" @click="settings.features.export.enabled = !settings.features.export.enabled" 
                                            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                            :class="settings.features.export.enabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'">
                                        <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                              :class="settings.features.export.enabled ? 'translate-x-6' : 'translate-x-1'"></span>
                                    </button>
                                </div>
                            </div>

                            <!-- Auto Save Settings -->
                            <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                <div class="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Auto Save</h3>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">Automatically save content while typing</p>
                                    </div>
                                    <button type="button" @click="settings.features.autoSave.enabled = !settings.features.autoSave.enabled" 
                                            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                            :class="settings.features.autoSave.enabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'">
                                        <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                              :class="settings.features.autoSave.enabled ? 'translate-x-6' : 'translate-x-1'"></span>
                                    </button>
                                </div>
                                <div x-show="settings.features.autoSave.enabled" class="pt-3 border-t border-gray-100 dark:border-gray-600">
                                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Save Interval (ms)</label>
                                    <input type="number" x-model="settings.features.autoSave.interval" min="5000" max="300000" step="1000"
                                           class="text-sm w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                </div>
                            </div>

                            <!-- Export Formats -->
                            <div x-show="settings.features.export.enabled" class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Export Formats</h3>
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <template x-for="format in ['html', 'markdown', 'json', 'text']" :key="format">
                                        <label class="flex items-center space-x-2 cursor-pointer">
                                            <input type="checkbox" :checked="settings.features.export.formats.includes(format)" 
                                                   @change="toggleExportFormat(format)" 
                                                   class="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500">
                                            <span class="text-sm text-gray-700 dark:text-gray-300 capitalize" x-text="format"></span>
                                        </label>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Theme Settings -->
                    <div x-show="activeSection === 'theme'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Theme Settings</h2>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Customize the appearance and theme behavior</p>
                        </div>
                        <div class="p-6 space-y-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Theme</label>
                                <div class="grid grid-cols-3 gap-3">
                                    <template x-for="theme in ['light', 'dark', 'auto']" :key="theme">
                                        <button type="button" @click="settings.theme.default = theme"
                                                class="px-4 py-3 rounded-lg border-2 transition-colors text-sm font-medium"
                                                :class="settings.theme.default === theme ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'">
                                            <span class="capitalize" x-text="theme"></span>
                                        </button>
                                    </template>
                                </div>
                            </div>

                            <div class="flex items-center justify-between">
                                <div>
                                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Theme Toggle</label>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Let users switch between themes</p>
                                </div>
                                <button type="button" @click="settings.theme.allowToggle = !settings.theme.allowToggle" 
                                        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                        :class="settings.theme.allowToggle ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'">
                                    <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                          :class="settings.theme.allowToggle ? 'translate-x-6' : 'translate-x-1'"></span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Security Settings -->
                    <div x-show="activeSection === 'security'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Security Settings</h2>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Configure security and content restrictions</p>
                        </div>
                        <div class="p-6 space-y-6">
                            <div class="flex items-center justify-between">
                                <div>
                                    <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Sanitize Content</label>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Remove potentially harmful HTML</p>
                                </div>
                                <button type="button" @click="settings.security.sanitize = !settings.security.sanitize" 
                                        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                        :class="settings.security.sanitize ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'">
                                    <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                          :class="settings.security.sanitize ? 'translate-x-6' : 'translate-x-1'"></span>
                                </button>
                            </div>

                            <div x-show="settings.security.sanitize">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Allowed HTML Tags</label>
                                <textarea x-model="settings.security.allowedTags" rows="3"
                                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                          placeholder="p,br,strong,em,u,a,h1,h2,h3,h4,h5,h6"></textarea>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Blocks</label>
                                    <input type="number" x-model="settings.security.maxBlocks" min="1" max="10000"
                                           class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max File Size (MB)</label>
                                    <input type="number" x-model="settings.security.maxFileSize" min="1" max="50"
                                           class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Performance Settings -->
                    <div x-show="activeSection === 'performance'" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Performance Settings</h2>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Optimize editor performance and responsiveness</p>
                        </div>
                        <div class="p-6 space-y-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Lazy Load</label>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">Load content on demand</p>
                                    </div>
                                    <button type="button" @click="settings.performance.lazyLoad = !settings.performance.lazyLoad" 
                                            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                            :class="settings.performance.lazyLoad ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'">
                                        <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                              :class="settings.performance.lazyLoad ? 'translate-x-6' : 'translate-x-1'"></span>
                                    </button>
                                </div>

                                <div class="flex items-center justify-between">
                                    <div>
                                        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Cache Assets</label>
                                        <p class="text-xs text-gray-500 dark:text-gray-400">Cache CSS and JS files</p>
                                    </div>
                                    <button type="button" @click="settings.performance.cacheAssets = !settings.performance.cacheAssets" 
                                            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                            :class="settings.performance.cacheAssets ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'">
                                        <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                              :class="settings.performance.cacheAssets ? 'translate-x-6' : 'translate-x-1'"></span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Debounce Delay (ms)</label>
                                <input type="number" x-model="settings.performance.debounce" min="100" max="5000" step="100"
                                       class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Delay before triggering events like auto-save</p>
                            </div>
                        </div>
                    </div>

                    <!-- Save Button -->
                    <div class="flex justify-end pt-6">
                        <button type="submit" :disabled="saving" 
                                class="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2">
                            <svg x-show="saving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span x-text="saving ? 'Saving...' : 'Save Settings'"></span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script>
        function settingsApp() {
            console.log('settingsApp() initialized');
            return {
                activeSection: 'editor',
                saving: false,
                notification: {
                    show: false,
                    type: 'success',
                    message: ''
                },
                settings: @json($settings),
                
                init() {
                    console.log('Alpine component initialized with settings:', this.settings);
                    console.log('Editor placeholder value:', this.settings.editor?.placeholder);
                },
                sections: {
                    editor: {
                        title: 'Editor',
                        icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>'
                    },
                    tools: {
                        title: 'Tools',
                        icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>'
                    },
                    features: {
                        title: 'Features',
                        icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>'
                    },
                    theme: {
                        title: 'Theme',
                        icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4 4 4 0 004-4V5z"></path></svg>'
                    },
                    security: {
                        title: 'Security',
                        icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>'
                    },
                    performance: {
                        title: 'Performance',
                        icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>'
                    }
                },

                getToolDescription(toolKey) {
                    const descriptions = {
                        header: 'Add headings to structure your content',
                        paragraph: 'Basic text paragraphs',
                        list: 'Ordered and unordered lists',
                        quote: 'Blockquotes and citations',
                        code: 'Code blocks with syntax highlighting',
                        table: 'Data tables with customizable size',
                        image: 'Image uploads and embedding'
                    };
                    return descriptions[toolKey] || 'Configure this tool';
                },

                toggleHeaderLevel(level) {
                    const levels = this.settings.tools.header.config.levels;
                    const index = levels.indexOf(level);
                    if (index > -1) {
                        levels.splice(index, 1);
                    } else {
                        levels.push(level);
                    }
                    levels.sort((a, b) => a - b);
                },

                toggleExportFormat(format) {
                    const formats = this.settings.features.export.formats;
                    const index = formats.indexOf(format);
                    if (index > -1) {
                        formats.splice(index, 1);
                    } else {
                        formats.push(format);
                    }
                },

                // Helper function to flatten nested object to dot notation
                flattenObject(obj, prefix = '') {
                    let flattened = {};
                    for (let key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            const newKey = prefix ? `${prefix}.${key}` : key;
                            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                                Object.assign(flattened, this.flattenObject(obj[key], newKey));
                            } else {
                                flattened[newKey] = obj[key];
                            }
                        }
                    }
                    return flattened;
                },

                async saveSettings() {
                    console.log('saveSettings called');
                    this.saving = true;
                    try {
                        // Flatten the settings object to match the validation rules
                        const flattenedSettings = this.flattenObject(this.settings);
                        console.log('Flattened settings:', flattenedSettings);
                        
                        const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
                        console.log('CSRF Token:', token);
                        
                        const response = await fetch('/writr/settings', {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'X-Requested-With': 'XMLHttpRequest',
                                'X-CSRF-TOKEN': token
                            },
                            body: JSON.stringify(flattenedSettings)
                        });

                        console.log('Response status:', response.status);
                        const data = await response.json();
                        console.log('Response data:', data);

                        if (data.success) {
                            console.log('Success! Updating settings with:', data.settings);
                            this.showNotification('success', data.message);
                            // Update settings with the response
                            this.settings = data.settings;
                            console.log('Settings updated to:', this.settings);
                        } else {
                            this.showNotification('error', data.message || 'Failed to save settings');
                            if (data.errors) {
                                console.error('Validation errors:', data.errors);
                            }
                        }
                    } catch (error) {
                        console.error('Save error:', error);
                        this.showNotification('error', 'An error occurred while saving');
                    }
                    this.saving = false;
                },

                async resetSettings() {
                    if (!confirm('Are you sure you want to reset all settings to defaults?')) return;

                    try {
                        const response = await fetch('{{ route("writr.settings.reset") }}', {
                            method: 'POST',
                            headers: {
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                                'X-Requested-With': 'XMLHttpRequest',
                                'Accept': 'application/json'
                            }
                        });

                        const data = await response.json();

                        if (data.success) {
                            this.settings = data.settings;
                            this.showNotification('success', data.message);
                        } else {
                            this.showNotification('error', 'Failed to reset settings');
                        }
                    } catch (error) {
                        this.showNotification('error', 'An error occurred while resetting');
                    }
                },

                async exportSettings() {
                    try {
                        const response = await fetch('{{ route("writr.settings.export") }}', {
                            headers: {
                                'X-Requested-With': 'XMLHttpRequest'
                            }
                        });
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'writr-settings.json';
                        a.click();
                        window.URL.revokeObjectURL(url);
                    } catch (error) {
                        this.showNotification('error', 'Failed to export settings');
                    }
                },

                async importSettings(event) {
                    const file = event.target.files[0];
                    if (!file) return;

                    try {
                        const text = await file.text();
                        const response = await fetch('{{ route("writr.settings.import") }}', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                                'X-Requested-With': 'XMLHttpRequest',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({ settings: text })
                        });

                        const data = await response.json();

                        if (data.success) {
                            location.reload(); // Reload to get fresh settings
                        } else {
                            this.showNotification('error', 'Failed to import settings');
                        }
                    } catch (error) {
                        this.showNotification('error', 'Invalid settings file');
                    }
                },

                showNotification(type, message) {
                    console.log('Showing notification:', type, message);
                    this.notification = { show: true, type, message };
                    setTimeout(() => {
                        this.notification.show = false;
                    }, 5000);
                }
            };
        }
    </script>
</body>
</html>
