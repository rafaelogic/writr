<?php

namespace Rafaelogic\Writr\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class WritrService
{
    protected array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    /**
     * Process and clean Writr content.
     */
    public function processContent(string $content): array
    {
        $decoded = json_decode($content, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \InvalidArgumentException('Invalid JSON content');
        }

        if (!isset($decoded['blocks']) || !is_array($decoded['blocks'])) {
            throw new \InvalidArgumentException('Invalid Writr content structure');
        }

        // Sanitize content if enabled
        if ($this->config['security']['sanitize_html'] ?? true) {
            $decoded['blocks'] = $this->sanitizeBlocks($decoded['blocks']);
        }

        return $decoded;
    }

    /**
     * Convert Writr content to HTML.
     */
    public function toHtml(array $content): string
    {
        if (!isset($content['blocks'])) {
            return '';
        }

        $html = '';
        foreach ($content['blocks'] as $block) {
            $html .= $this->blockToHtml($block);
        }

        return $html;
    }

    /**
     * Convert Writr content to Markdown.
     */
    public function toMarkdown(array $content): string
    {
        if (!isset($content['blocks'])) {
            return '';
        }

        $markdown = '';
        foreach ($content['blocks'] as $block) {
            $markdown .= $this->blockToMarkdown($block) . "\n\n";
        }

        return trim($markdown);
    }

    /**
     * Extract plain text from Writr content.
     */
    public function toText(array $content): string
    {
        if (!isset($content['blocks'])) {
            return '';
        }

        $text = '';
        foreach ($content['blocks'] as $block) {
            $text .= $this->blockToText($block) . "\n";
        }

        return trim($text);
    }

    /**
     * Upload file for Writr editor.
     */
    public function uploadFile(UploadedFile $file, string $type = 'file'): array
    {
        $disk = Storage::disk($this->config['uploads']['disk']);
        $path = $this->config['uploads']['path'];

        // Validate file
        $this->validateFile($file, $type);

        // Generate unique filename
        $filename = time() . '_' . $file->getClientOriginalName();
        $filePath = $disk->putFileAs($path, $file, $filename);

        return [
            'success' => 1,
            'file' => [
                'url' => $disk->url($filePath),
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'extension' => $file->getClientOriginalExtension(),
                'path' => $filePath,
            ]
        ];
    }

    /**
     * Generate table of contents from content.
     */
    public function generateToc(array $content): array
    {
        if (!isset($content['blocks'])) {
            return [];
        }

        $toc = [];
        foreach ($content['blocks'] as $block) {
            if ($block['type'] === 'header' && isset($block['data']['text'])) {
                $level = $block['data']['level'] ?? 1;
                $text = strip_tags($block['data']['text']);
                $id = 'heading-' . md5($text);

                $toc[] = [
                    'level' => $level,
                    'text' => $text,
                    'id' => $id,
                ];
            }
        }

        return $toc;
    }

    /**
     * Count words in content.
     */
    public function countWords(array $content): int
    {
        $text = $this->toText($content);
        return str_word_count($text);
    }

    /**
     * Sanitize blocks content.
     */
    protected function sanitizeBlocks(array $blocks): array
    {
        $allowedTags = $this->config['security']['allowed_html_tags'] ?? [];
        
        foreach ($blocks as &$block) {
            if (isset($block['data'])) {
                $block['data'] = $this->sanitizeBlockData($block['data'], $allowedTags);
            }
        }

        return $blocks;
    }

    /**
     * Sanitize block data recursively.
     */
    protected function sanitizeBlockData($data, array $allowedTags): mixed
    {
        if (is_string($data)) {
            return strip_tags($data, '<' . implode('><', $allowedTags) . '>');
        }

        if (is_array($data)) {
            foreach ($data as $key => $value) {
                $data[$key] = $this->sanitizeBlockData($value, $allowedTags);
            }
        }

        return $data;
    }

    /**
     * Convert block to HTML.
     */
    protected function blockToHtml(array $block): string
    {
        $type = $block['type'] ?? 'paragraph';
        $data = $block['data'] ?? [];

        return match ($type) {
            'paragraph' => '<p>' . ($data['text'] ?? '') . '</p>',
            'header' => '<h' . ($data['level'] ?? 2) . '>' . ($data['text'] ?? '') . '</h' . ($data['level'] ?? 2) . '>',
            'list' => $this->listToHtml($data),
            'quote' => '<blockquote><p>' . ($data['text'] ?? '') . '</p>' . 
                      (isset($data['caption']) ? '<cite>' . $data['caption'] . '</cite>' : '') . '</blockquote>',
            'code' => '<pre><code>' . htmlspecialchars($data['code'] ?? '') . '</code></pre>',
            'delimiter' => '<hr>',
            'table' => $this->tableToHtml($data),
            'warning' => '<div class="warning"><h4>' . ($data['title'] ?? '') . '</h4><p>' . ($data['message'] ?? '') . '</p></div>',
            'image' => '<img src="' . ($data['file']['url'] ?? '') . '" alt="' . ($data['caption'] ?? '') . '">',
            default => '<div>' . json_encode($data) . '</div>',
        };
    }

    /**
     * Convert block to Markdown.
     */
    protected function blockToMarkdown(array $block): string
    {
        $type = $block['type'] ?? 'paragraph';
        $data = $block['data'] ?? [];

        return match ($type) {
            'paragraph' => $data['text'] ?? '',
            'header' => str_repeat('#', $data['level'] ?? 2) . ' ' . ($data['text'] ?? ''),
            'list' => $this->listToMarkdown($data),
            'quote' => '> ' . ($data['text'] ?? ''),
            'code' => '```' . "\n" . ($data['code'] ?? '') . "\n" . '```',
            'delimiter' => '---',
            'warning' => '⚠️ **' . ($data['title'] ?? '') . '**' . "\n" . ($data['message'] ?? ''),
            'image' => '![' . ($data['caption'] ?? '') . '](' . ($data['file']['url'] ?? '') . ')',
            default => json_encode($data),
        };
    }

    /**
     * Extract text from block.
     */
    protected function blockToText(array $block): string
    {
        $type = $block['type'] ?? 'paragraph';
        $data = $block['data'] ?? [];

        return match ($type) {
            'paragraph' => strip_tags($data['text'] ?? ''),
            'header' => strip_tags($data['text'] ?? ''),
            'list' => $this->listToText($data),
            'quote' => strip_tags($data['text'] ?? ''),
            'code' => $data['code'] ?? '',
            'warning' => ($data['title'] ?? '') . ' ' . ($data['message'] ?? ''),
            default => '',
        };
    }

    /**
     * Convert list data to HTML.
     */
    protected function listToHtml(array $data): string
    {
        $items = $data['items'] ?? [];
        $style = $data['style'] ?? 'unordered';
        $tag = $style === 'ordered' ? 'ol' : 'ul';

        $html = "<{$tag}>";
        foreach ($items as $item) {
            $html .= '<li>' . ($item ?? '') . '</li>';
        }
        $html .= "</{$tag}>";

        return $html;
    }

    /**
     * Convert list data to Markdown.
     */
    protected function listToMarkdown(array $data): string
    {
        $items = $data['items'] ?? [];
        $style = $data['style'] ?? 'unordered';
        $marker = $style === 'ordered' ? '1.' : '-';

        $markdown = '';
        foreach ($items as $index => $item) {
            if ($style === 'ordered') {
                $markdown .= ($index + 1) . '. ' . strip_tags($item ?? '') . "\n";
            } else {
                $markdown .= '- ' . strip_tags($item ?? '') . "\n";
            }
        }

        return trim($markdown);
    }

    /**
     * Extract text from list data.
     */
    protected function listToText(array $data): string
    {
        $items = $data['items'] ?? [];
        return implode("\n", array_map('strip_tags', $items));
    }

    /**
     * Convert table data to HTML.
     */
    protected function tableToHtml(array $data): string
    {
        $content = $data['content'] ?? [];
        if (empty($content)) {
            return '';
        }

        $html = '<table>';
        foreach ($content as $rowIndex => $row) {
            $html .= '<tr>';
            foreach ($row as $cell) {
                $tag = $rowIndex === 0 ? 'th' : 'td';
                $html .= "<{$tag}>" . ($cell ?? '') . "</{$tag}>";
            }
            $html .= '</tr>';
        }
        $html .= '</table>';

        return $html;
    }

    /**
     * Validate uploaded file.
     */
    protected function validateFile(UploadedFile $file, string $type): void
    {
        $maxSize = $this->config['uploads']['max_file_size'];
        if ($file->getSize() > $maxSize) {
            throw new \InvalidArgumentException("File size exceeds maximum allowed size of {$maxSize} bytes");
        }

        $allowedExtensions = $this->config['uploads']['allowed_extensions'][$type] ?? [];
        if (!empty($allowedExtensions)) {
            $extension = strtolower($file->getClientOriginalExtension());
            if (!in_array($extension, $allowedExtensions)) {
                throw new \InvalidArgumentException("File extension '{$extension}' is not allowed");
            }
        }
    }
}
