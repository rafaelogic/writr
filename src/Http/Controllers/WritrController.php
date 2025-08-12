<?php

namespace Rafaelogic\Writr\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Rafaelogic\Writr\Services\WritrService;
use Rafaelogic\Writr\Services\AssetManager;

class WritrController
{
    protected WritrService $writrService;
    protected AssetManager $assetManager;

    public function __construct(WritrService $writrService, AssetManager $assetManager)
    {
        $this->writrService = $writrService;
        $this->assetManager = $assetManager;
    }

    /**
     * Upload image for the editor
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp,svg|max:' . (config('writr.uploads.max_file_size') / 1024)
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => 0,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $result = $this->writrService->uploadFile($request->file('image'), 'images');
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'success' => 0,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload file for the editor
     */
    public function uploadFile(Request $request): JsonResponse
    {
        $maxSize = config('writr.uploads.max_file_size') / 1024;
        
        $validator = Validator::make($request->all(), [
            'file' => "required|file|max:{$maxSize}"
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => 0,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $result = $this->writrService->uploadFile($request->file('file'), 'documents');
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'success' => 0,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Fetch URL metadata for link tool
     */
    public function fetchUrl(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'url' => 'required|url'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => 0,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $url = $request->input('url');
            $response = Http::timeout(10)->get($url);
            
            if (!$response->successful()) {
                throw new \Exception('Failed to fetch URL');
            }

            $html = $response->body();
            $metadata = $this->extractMetadata($html, $url);

            return response()->json([
                'success' => 1,
                'link' => $url,
                'meta' => $metadata
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => 0,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Fetch image by URL
     */
    public function fetchImage(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'url' => 'required|url'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => 0,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $url = $request->input('url');
            
            // Validate image URL
            if (!$this->isValidImageUrl($url)) {
                throw new \Exception('Invalid image URL');
            }

            return response()->json([
                'success' => 1,
                'file' => [
                    'url' => $url
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => 0,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate preview of content
     */
    public function preview(Request $request): JsonResponse
    {
        try {
            $content = $request->getContent();
            $data = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('Invalid JSON content');
            }

            $html = $this->writrService->toHtml($data);
            
            return response()->json([
                'success' => 1,
                'html' => $html
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => 0,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export content to various formats
     */
    public function export(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|json',
            'format' => 'required|in:html,markdown,text,json'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => 0,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $content = json_decode($request->input('content'), true);
            $format = $request->input('format');

            $result = match ($format) {
                'html' => $this->writrService->toHtml($content),
                'markdown' => $this->writrService->toMarkdown($content),
                'text' => $this->writrService->toText($content),
                'json' => json_encode($content, JSON_PRETTY_PRINT),
                default => throw new \Exception('Unsupported format')
            };

            return response()->json([
                'success' => 1,
                'format' => $format,
                'content' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => 0,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Import content from various formats
     */
    public function import(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
            'format' => 'required|in:html,markdown,text'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => 0,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $content = $request->input('content');
            $format = $request->input('format');

            // This would use the importer utility from the frontend
            // For now, return a simple conversion
            $blocks = $this->convertToBlocks($content, $format);

            return response()->json([
                'success' => 1,
                'data' => [
                    'time' => time(),
                    'blocks' => $blocks,
                    'version' => '2.28.2'
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => 0,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Auto-save content
     */
    public function autoSave(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|json',
            'name' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => 0,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $content = $request->input('content');
            $name = $request->input('name');
            
            // Store auto-save data (implement based on your storage needs)
            $key = 'autosave_' . session()->getId() . '_' . $name;
            cache()->put($key, $content, now()->addHour());

            return response()->json([
                'success' => 1,
                'message' => 'Content auto-saved',
                'timestamp' => time()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => 0,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Join collaboration session
     */
    public function joinCollaboration(Request $request): JsonResponse
    {
        // Implement collaboration logic
        return response()->json([
            'success' => 1,
            'message' => 'Collaboration feature requires additional setup'
        ]);
    }

    /**
     * Leave collaboration session
     */
    public function leaveCollaboration(Request $request): JsonResponse
    {
        // Implement collaboration logic
        return response()->json([
            'success' => 1,
            'message' => 'Left collaboration session'
        ]);
    }

    /**
     * Update collaboration content
     */
    public function updateCollaboration(Request $request): JsonResponse
    {
        // Implement collaboration logic
        return response()->json([
            'success' => 1,
            'message' => 'Collaboration update received'
        ]);
    }

    /**
     * Get collaborators for a document
     */
    public function getCollaborators(Request $request, string $document): JsonResponse
    {
        // Implement collaboration logic
        return response()->json([
            'success' => 1,
            'collaborators' => []
        ]);
    }

    /**
     * Create a comment
     */
    public function createComment(Request $request): JsonResponse
    {
        // Implement comments logic
        return response()->json([
            'success' => 1,
            'message' => 'Comment created'
        ]);
    }

    /**
     * Update a comment
     */
    public function updateComment(Request $request, string $comment): JsonResponse
    {
        // Implement comments logic
        return response()->json([
            'success' => 1,
            'message' => 'Comment updated'
        ]);
    }

    /**
     * Delete a comment
     */
    public function deleteComment(Request $request, string $comment): JsonResponse
    {
        // Implement comments logic
        return response()->json([
            'success' => 1,
            'message' => 'Comment deleted'
        ]);
    }

    /**
     * Get comments for a document
     */
    public function getComments(Request $request, string $document): JsonResponse
    {
        // Implement comments logic
        return response()->json([
            'success' => 1,
            'comments' => []
        ]);
    }

    /**
     * Get version history
     */
    public function getVersions(Request $request, string $document): JsonResponse
    {
        // Implement version history logic
        return response()->json([
            'success' => 1,
            'versions' => []
        ]);
    }

    /**
     * Create a new version
     */
    public function createVersion(Request $request, string $document): JsonResponse
    {
        // Implement version history logic
        return response()->json([
            'success' => 1,
            'message' => 'Version created'
        ]);
    }

    /**
     * Get specific version
     */
    public function getVersion(Request $request, string $document, string $version): JsonResponse
    {
        // Implement version history logic
        return response()->json([
            'success' => 1,
            'version' => []
        ]);
    }

    /**
     * Restore a version
     */
    public function restoreVersion(Request $request, string $document, string $version): JsonResponse
    {
        // Implement version history logic
        return response()->json([
            'success' => 1,
            'message' => 'Version restored'
        ]);
    }

    /**
     * Health check endpoint
     */
    public function health(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'version' => '1.0.0',
            'timestamp' => time()
        ]);
    }

    /**
     * Extract metadata from HTML
     */
    protected function extractMetadata(string $html, string $url): array
    {
        $metadata = [
            'title' => '',
            'description' => '',
            'image' => [
                'url' => ''
            ]
        ];

        // Parse HTML
        $dom = new \DOMDocument();
        @$dom->loadHTML($html);
        $xpath = new \DOMXPath($dom);

        // Extract title
        $titleNodes = $xpath->query('//title | //meta[@property="og:title"]/@content | //meta[@name="twitter:title"]/@content');
        if ($titleNodes->length > 0) {
            $metadata['title'] = trim($titleNodes->item(0)->textContent ?? $titleNodes->item(0)->nodeValue ?? '');
        }

        // Extract description
        $descNodes = $xpath->query('//meta[@name="description"]/@content | //meta[@property="og:description"]/@content | //meta[@name="twitter:description"]/@content');
        if ($descNodes->length > 0) {
            $metadata['description'] = trim($descNodes->item(0)->nodeValue ?? '');
        }

        // Extract image
        $imgNodes = $xpath->query('//meta[@property="og:image"]/@content | //meta[@name="twitter:image"]/@content');
        if ($imgNodes->length > 0) {
            $imageUrl = trim($imgNodes->item(0)->nodeValue ?? '');
            if ($imageUrl && !filter_var($imageUrl, FILTER_VALIDATE_URL)) {
                $imageUrl = rtrim($url, '/') . '/' . ltrim($imageUrl, '/');
            }
            $metadata['image']['url'] = $imageUrl;
        }

        return $metadata;
    }

    /**
     * Check if URL is a valid image
     */
    protected function isValidImageUrl(string $url): bool
    {
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        $extension = strtolower(pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION));
        
        return in_array($extension, $imageExtensions);
    }

    /**
     * Convert content to Editor.js blocks (basic implementation)
     */
    protected function convertToBlocks(string $content, string $format): array
    {
        $blocks = [];

        switch ($format) {
            case 'text':
                $paragraphs = explode("\n\n", $content);
                foreach ($paragraphs as $paragraph) {
                    if (trim($paragraph)) {
                        $blocks[] = [
                            'id' => Str::random(10),
                            'type' => 'paragraph',
                            'data' => [
                                'text' => trim($paragraph)
                            ]
                        ];
                    }
                }
                break;

            case 'html':
                // Basic HTML to blocks conversion
                $blocks[] = [
                    'id' => Str::random(10),
                    'type' => 'paragraph',
                    'data' => [
                        'text' => strip_tags($content)
                    ]
                ];
                break;

            case 'markdown':
                // Basic Markdown to blocks conversion
                $lines = explode("\n", $content);
                foreach ($lines as $line) {
                    $line = trim($line);
                    if (empty($line)) continue;

                    if (preg_match('/^#+\s+(.+)/', $line, $matches)) {
                        $level = substr_count($line, '#');
                        $blocks[] = [
                            'id' => Str::random(10),
                            'type' => 'header',
                            'data' => [
                                'text' => $matches[1],
                                'level' => min($level, 6)
                            ]
                        ];
                    } else {
                        $blocks[] = [
                            'id' => Str::random(10),
                            'type' => 'paragraph',
                            'data' => [
                                'text' => $line
                            ]
                        ];
                    }
                }
                break;
        }

        return $blocks;
    }
}
