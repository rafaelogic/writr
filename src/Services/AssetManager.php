<?php

namespace Rafaelogic\Writr\Services;

class AssetManager
{
    protected array $config;
    protected string $version;

    public function __construct(array $config)
    {
        $this->config = $config;
        $this->version = '1.0.0'; // This would normally come from package version
    }

    /**
     * Get the JavaScript asset URL.
     */
    public function getJsUrl(): string
    {
        if ($this->config['performance']['minify_output'] ?? false) {
            return asset('vendor/writr/writr.min.js?v=' . $this->version);
        }

        return asset('vendor/writr/writr.js?v=' . $this->version);
    }

    /**
     * Get the bundled JavaScript asset URL (includes all dependencies).
     */
    public function getBundleUrl(): string
    {
        // Use writr.js as the single source of truth (self-contained bundle)
        return $this->getJsUrl();
    }

    /**
     * Get the CSS asset URL.
     */
    public function getCssUrl(): string
    {
        if ($this->config['performance']['minify_output'] ?? false) {
            return asset('vendor/writr/writr.min.css?v=' . $this->version);
        }

        return asset('vendor/writr/writr.css?v=' . $this->version);
    }

    /**
     * Get all asset URLs.
     */
    public function getAssetUrls(): array
    {
        return [
            'js' => $this->getJsUrl(),
            'bundle' => $this->getBundleUrl(),
            'css' => $this->getCssUrl(),
        ];
    }

    /**
     * Check if assets are cached.
     */
    public function shouldCache(): bool
    {
        return $this->config['performance']['cache_assets'] ?? true;
    }

    /**
     * Get cache duration in seconds.
     */
    public function getCacheDuration(): int
    {
        return 86400; // 24 hours
    }
}
