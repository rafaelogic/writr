<?php

namespace Rafaelogic\Writr;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Blade;
use Rafaelogic\Writr\Components\WritrEditor;
use Rafaelogic\Writr\Services\WritrService;
use Rafaelogic\Writr\Services\AssetManager;
use Rafaelogic\Writr\Services\SettingsService;

class WritrServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->mergeConfigFrom(
            __DIR__ . '/../config/writr.php',
            'writr'
        );

        $this->app->singleton('writr', function ($app) {
            return new WritrService($app['config']['writr']);
        });

        $this->app->singleton(AssetManager::class, function ($app) {
            return new AssetManager($app['config']['writr']);
        });

        $this->app->singleton(SettingsService::class, function ($app) {
            return new SettingsService();
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__ . '/../resources/views', 'writr');

        $this->publishes([
            __DIR__ . '/../resources/views' => resource_path('views/vendor/writr'),
        ], 'writr-views');

        $this->publishes([
            __DIR__ . '/../config/writr.php' => config_path('writr.php'),
        ], 'writr-config');

        // Publish compiled assets from public directory
        $this->publishes([
            __DIR__ . '/../public/js' => public_path('vendor/writr'),
            __DIR__ . '/../public/css' => public_path('vendor/writr'),
        ], 'writr-assets');

        // Also publish raw resources for development
        $this->publishes([
            __DIR__ . '/../resources/js' => public_path('vendor/writr/js'),
            __DIR__ . '/../resources/sass' => public_path('vendor/writr/sass'),
        ], 'writr-resources');

        // Only publish migrations if they exist
        if (is_dir(__DIR__ . '/../database/migrations')) {
            $this->publishes([
                __DIR__ . '/../database/migrations' => database_path('migrations'),
            ], 'writr-migrations');
        }

        // Register Blade component
        Blade::component('writr-editor', WritrEditor::class);

        // Register validation rules
        $this->registerValidationRules();

        // Load routes if enabled
        if (config('writr.routes.enabled', true)) {
            $this->loadRoutesFrom(__DIR__ . '/../routes/web.php');
        }
    }

    /**
     * Register custom validation rules for Writr content.
     */
    protected function registerValidationRules(): void
    {
        $this->app['validator']->extend('writr_content', function ($attribute, $value, $parameters, $validator) {
            if (empty($value)) {
                return true;
            }

            $decoded = json_decode($value, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                return false;
            }

            return isset($decoded['blocks']) && is_array($decoded['blocks']);
        });

        $this->app['validator']->replacer('writr_content', function ($message, $attribute, $rule, $parameters) {
            return str_replace(':attribute', $attribute, 'The :attribute field must contain valid Writr editor content.');
        });
    }

    /**
     * Get the services provided by the provider.
     */
    public function provides(): array
    {
        return ['writr', AssetManager::class, SettingsService::class];
    }
}
