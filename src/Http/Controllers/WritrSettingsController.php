<?php

namespace Rafaelogic\Writr\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Rafaelogic\Writr\Services\SettingsService;

class WritrSettingsController extends Controller
{
    protected SettingsService $settingsService;

    public function __construct(SettingsService $settingsService)
    {
        $this->settingsService = $settingsService;
    }

    /**
     * Display the settings index page
     */
    public function index()
    {
        $settings = $this->settingsService->getSettings();
        $jsConfig = $this->settingsService->toJavaScriptConfig();
        $cssVariables = $this->settingsService->getCssVariables();

        return view('writr::settings.index', compact('settings', 'jsConfig', 'cssVariables'));
    }

    /**
     * Update settings
     */
    public function update(Request $request): JsonResponse|RedirectResponse
    {
        Log::info('WritrSettingsController::update called', [
            'method' => $request->method(),
            'url' => $request->url(),
            'headers' => $request->headers->all(),
            'data' => $request->all()
        ]);

        $validator = Validator::make($request->all(), [
            // Editor settings
            'editor.placeholder' => 'sometimes|string|max:255',
            'editor.autofocus' => 'sometimes|boolean',
            'editor.readonly' => 'sometimes|boolean',
            'editor.min_height' => 'sometimes|integer|min:100|max:2000',
            'editor.max_height' => 'sometimes|nullable|integer|min:200|max:5000',
            'editor.spellcheck' => 'sometimes|boolean',
            
            // Tools settings
            'tools.header.enabled' => 'sometimes|boolean',
            'tools.header.config.levels' => 'sometimes|array',
            'tools.header.config.levels.*' => 'integer|between:1,6',
            'tools.header.config.defaultLevel' => 'sometimes|integer|between:1,6',
            'tools.header.config.allowAnchor' => 'sometimes|boolean',
            
            'tools.paragraph.enabled' => 'sometimes|boolean',
            'tools.paragraph.config.preserveBlank' => 'sometimes|boolean',
            
            'tools.list.enabled' => 'sometimes|boolean',
            'tools.list.config.defaultStyle' => 'sometimes|string|in:ordered,unordered',
            
            'tools.quote.enabled' => 'sometimes|boolean',
            'tools.quote.config.quotePlaceholder' => 'sometimes|string|max:255',
            'tools.quote.config.captionPlaceholder' => 'sometimes|string|max:255',
            
            'tools.code.enabled' => 'sometimes|boolean',
            'tools.code.config.placeholder' => 'sometimes|string|max:255',
            'tools.quote.config.quotePlaceholder' => 'sometimes|string|max:255',
            'tools.quote.config.captionPlaceholder' => 'sometimes|string|max:255',
            
            'tools.code.enabled' => 'sometimes|boolean',
            'tools.code.config.placeholder' => 'sometimes|string|max:255',
            
            'tools.table.enabled' => 'sometimes|boolean',
            'tools.table.config.rows' => 'sometimes|integer|min:1|max:20',
            'tools.table.config.cols' => 'sometimes|integer|min:1|max:20',
            
            'tools.image.enabled' => 'sometimes|boolean',
            'tools.image.config.field' => 'sometimes|string|max:100',
            'tools.image.config.types' => 'sometimes|string|max:255',
            'tools.image.config.captionPlaceholder' => 'sometimes|string|max:255',
            
            // Features settings
            'features.darkMode' => 'sometimes|boolean',
            'features.wordCount' => 'sometimes|boolean',
            'features.tableOfContents' => 'sometimes|boolean',
            'features.autoSave.enabled' => 'sometimes|boolean',
            'features.autoSave.interval' => 'sometimes|integer|min:1000|max:60000',
            'features.export.enabled' => 'sometimes|boolean',
            'features.export.formats' => 'sometimes|array',
            'features.export.formats.*' => 'string|in:html,markdown,json',
            
            // Theme settings
            'theme.default' => 'sometimes|string|in:light,dark',
            'theme.allowToggle' => 'sometimes|boolean',
            
            // Security settings
            'security.sanitize' => 'sometimes|boolean',
            'security.allowedTags' => 'sometimes|string|max:500',
            'security.maxBlocks' => 'sometimes|integer|min:1|max:10000',
            'security.maxFileSize' => 'sometimes|integer|min:1|max:100',
            
            // Performance settings
            'performance.lazyLoad' => 'sometimes|boolean',
            'performance.debounce' => 'sometimes|integer|min:100|max:2000',
            'performance.cacheAssets' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }
            return back()->withErrors($validator)->withInput();
        }

        try {
            Log::info('About to save settings', ['flattened_data' => $request->all()]);
            $this->settingsService->saveSettings($request->all());
            
            // Only clear merged cache, not the main settings cache we just saved to
            Cache::forget('writr.settings.merged');

            $retrievedSettings = $this->settingsService->getSettings();
            Log::info('Retrieved settings after save', ['settings' => $retrievedSettings]);

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Settings updated successfully',
                    'settings' => $retrievedSettings
                ]);
            }

            return back()->with('success', 'Settings updated successfully');
        } catch (\Exception $e) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update settings: ' . $e->getMessage()
                ], 500);
            }
            return back()->with('error', 'Failed to update settings: ' . $e->getMessage());
        }
    }

    /**
     * Reset settings to defaults
     */
    public function reset(Request $request): JsonResponse|RedirectResponse
    {
        try {
            $this->settingsService->resetSettings();
            
            // Clear any cached settings (use specific keys instead of tags for compatibility)
            Cache::forget('writr.settings');
            Cache::forget('writr.settings.merged');

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Settings reset to defaults',
                    'settings' => $this->settingsService->getSettings()
                ]);
            }

            return back()->with('success', 'Settings reset to defaults');
        } catch (\Exception $e) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to reset settings: ' . $e->getMessage()
                ], 500);
            }
            return back()->with('error', 'Failed to reset settings: ' . $e->getMessage());
        }
    }

    /**
     * Export settings
     */
    public function export()
    {
        try {
            $settings = $this->settingsService->getSettings();
            $filename = 'writr-settings-' . date('Y-m-d-H-i-s') . '.json';
            
            return response()->json($settings)
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
                ->header('Content-Type', 'application/json');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export settings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Import settings
     */
    public function import(Request $request): JsonResponse|RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'settings_file' => 'required|file|mimes:json|max:1024',
        ]);

        if ($validator->fails()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }
            return back()->withErrors($validator);
        }

        try {
            $file = $request->file('settings_file');
            $contents = file_get_contents($file->getRealPath());
            $settings = json_decode($contents, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('Invalid JSON format');
            }

            $this->settingsService->importSettings($settings);
            
            // Clear any cached settings (use specific keys instead of tags for compatibility)
            Cache::forget('writr.settings');
            Cache::forget('writr.settings.merged');

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Settings imported successfully',
                    'settings' => $this->settingsService->getSettings()
                ]);
            }

            return back()->with('success', 'Settings imported successfully');
        } catch (\Exception $e) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to import settings: ' . $e->getMessage()
                ], 500);
            }
            return back()->with('error', 'Failed to import settings: ' . $e->getMessage());
        }
    }
}
