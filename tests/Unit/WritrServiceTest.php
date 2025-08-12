<?php

namespace Writr\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Writr\Services\WritrService;

class WritrServiceTest extends TestCase
{
    protected WritrService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new WritrService();
    }

    /** @test */
    public function it_can_convert_editor_content_to_html()
    {
        $content = [
            'blocks' => [
                [
                    'type' => 'paragraph',
                    'data' => [
                        'text' => 'This is a test paragraph.'
                    ]
                ],
                [
                    'type' => 'header',
                    'data' => [
                        'text' => 'Test Header',
                        'level' => 2
                    ]
                ]
            ]
        ];

        $html = $this->service->convertToHtml($content);

        $this->assertStringContains('<p>This is a test paragraph.</p>', $html);
        $this->assertStringContains('<h2>Test Header</h2>', $html);
    }

    /** @test */
    public function it_can_convert_editor_content_to_markdown()
    {
        $content = [
            'blocks' => [
                [
                    'type' => 'header',
                    'data' => [
                        'text' => 'Main Title',
                        'level' => 1
                    ]
                ],
                [
                    'type' => 'paragraph',
                    'data' => [
                        'text' => 'This is a paragraph with **bold** text.'
                    ]
                ],
                [
                    'type' => 'list',
                    'data' => [
                        'style' => 'unordered',
                        'items' => ['Item 1', 'Item 2', 'Item 3']
                    ]
                ]
            ]
        ];

        $markdown = $this->service->convertToMarkdown($content);

        $this->assertStringContains('# Main Title', $markdown);
        $this->assertStringContains('This is a paragraph', $markdown);
        $this->assertStringContains('- Item 1', $markdown);
        $this->assertStringContains('- Item 2', $markdown);
    }

    /** @test */
    public function it_can_extract_plain_text_from_content()
    {
        $content = [
            'blocks' => [
                [
                    'type' => 'paragraph',
                    'data' => [
                        'text' => 'First paragraph.'
                    ]
                ],
                [
                    'type' => 'header',
                    'data' => [
                        'text' => 'Header Text',
                        'level' => 2
                    ]
                ],
                [
                    'type' => 'paragraph',
                    'data' => [
                        'text' => 'Second paragraph.'
                    ]
                ]
            ]
        ];

        $text = $this->service->extractPlainText($content);

        $this->assertStringContains('First paragraph.', $text);
        $this->assertStringContains('Header Text', $text);
        $this->assertStringContains('Second paragraph.', $text);
        $this->assertStringNotContains('<', $text);
        $this->assertStringNotContains('>', $text);
    }

    /** @test */
    public function it_can_count_words_in_content()
    {
        $content = [
            'blocks' => [
                [
                    'type' => 'paragraph',
                    'data' => [
                        'text' => 'This is a test paragraph with ten words total.'
                    ]
                ],
                [
                    'type' => 'header',
                    'data' => [
                        'text' => 'Two words',
                        'level' => 2
                    ]
                ]
            ]
        ];

        $wordCount = $this->service->getWordCount($content);

        $this->assertEquals(12, $wordCount); // 10 + 2 words
    }

    /** @test */
    public function it_can_generate_table_of_contents()
    {
        $content = [
            'blocks' => [
                [
                    'type' => 'header',
                    'data' => [
                        'text' => 'Introduction',
                        'level' => 1
                    ]
                ],
                [
                    'type' => 'paragraph',
                    'data' => [
                        'text' => 'Some content...'
                    ]
                ],
                [
                    'type' => 'header',
                    'data' => [
                        'text' => 'Chapter 1',
                        'level' => 2
                    ]
                ],
                [
                    'type' => 'header',
                    'data' => [
                        'text' => 'Subsection 1.1',
                        'level' => 3
                    ]
                ]
            ]
        ];

        $toc = $this->service->generateTableOfContents($content);

        $this->assertCount(3, $toc);
        $this->assertEquals('Introduction', $toc[0]['text']);
        $this->assertEquals(1, $toc[0]['level']);
        $this->assertEquals('Chapter 1', $toc[1]['text']);
        $this->assertEquals(2, $toc[1]['level']);
        $this->assertEquals('Subsection 1.1', $toc[2]['text']);
        $this->assertEquals(3, $toc[2]['level']);
    }

    /** @test */
    public function it_can_sanitize_content()
    {
        $content = [
            'blocks' => [
                [
                    'type' => 'paragraph',
                    'data' => [
                        'text' => 'Safe content <script>alert("xss")</script> with malicious code'
                    ]
                ]
            ]
        ];

        $sanitized = $this->service->sanitizeContent($content);

        $this->assertStringNotContains('<script>', $sanitized['blocks'][0]['data']['text']);
        $this->assertStringContains('Safe content', $sanitized['blocks'][0]['data']['text']);
        $this->assertStringContains('with malicious code', $sanitized['blocks'][0]['data']['text']);
    }

    /** @test */
    public function it_handles_different_block_types_in_html_conversion()
    {
        $content = [
            'blocks' => [
                [
                    'type' => 'quote',
                    'data' => [
                        'text' => 'This is a quote',
                        'caption' => 'Quote Author'
                    ]
                ],
                [
                    'type' => 'code',
                    'data' => [
                        'code' => 'console.log("Hello World");'
                    ]
                ],
                [
                    'type' => 'list',
                    'data' => [
                        'style' => 'ordered',
                        'items' => ['First item', 'Second item']
                    ]
                ]
            ]
        ];

        $html = $this->service->convertToHtml($content);

        $this->assertStringContains('<blockquote>', $html);
        $this->assertStringContains('This is a quote', $html);
        $this->assertStringContains('<pre><code>', $html);
        $this->assertStringContains('console.log', $html);
        $this->assertStringContains('<ol>', $html);
        $this->assertStringContains('<li>First item</li>', $html);
    }

    /** @test */
    public function it_handles_empty_content()
    {
        $emptyContent = [
            'blocks' => []
        ];

        $html = $this->service->convertToHtml($emptyContent);
        $markdown = $this->service->convertToMarkdown($emptyContent);
        $text = $this->service->extractPlainText($emptyContent);
        $wordCount = $this->service->getWordCount($emptyContent);
        $toc = $this->service->generateTableOfContents($emptyContent);

        $this->assertEquals('', $html);
        $this->assertEquals('', $markdown);
        $this->assertEquals('', $text);
        $this->assertEquals(0, $wordCount);
        $this->assertEmpty($toc);
    }

    /** @test */
    public function it_handles_invalid_content_gracefully()
    {
        $invalidContent = [
            'blocks' => [
                [
                    'type' => 'unknown_type',
                    'data' => [
                        'text' => 'Unknown block type'
                    ]
                ]
            ]
        ];

        $html = $this->service->convertToHtml($invalidContent);
        $markdown = $this->service->convertToMarkdown($invalidContent);

        // Should handle unknown types gracefully
        $this->assertIsString($html);
        $this->assertIsString($markdown);
    }

    /** @test */
    public function it_can_validate_upload_file_type()
    {
        $allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

        $this->assertTrue($this->service->validateFileType('image/jpeg', $allowedTypes));
        $this->assertTrue($this->service->validateFileType('application/pdf', $allowedTypes));
        $this->assertFalse($this->service->validateFileType('text/plain', $allowedTypes));
        $this->assertFalse($this->service->validateFileType('application/javascript', $allowedTypes));
    }

    /** @test */
    public function it_can_validate_file_size()
    {
        $maxSize = 2 * 1024 * 1024; // 2MB

        $this->assertTrue($this->service->validateFileSize(1024 * 1024, $maxSize)); // 1MB
        $this->assertTrue($this->service->validateFileSize(2 * 1024 * 1024, $maxSize)); // 2MB (exactly)
        $this->assertFalse($this->service->validateFileSize(3 * 1024 * 1024, $maxSize)); // 3MB
    }

    /** @test */
    public function it_can_generate_unique_filename()
    {
        $originalName = 'test-file.jpg';
        
        $filename1 = $this->service->generateUniqueFilename($originalName);
        $filename2 = $this->service->generateUniqueFilename($originalName);

        $this->assertNotEquals($filename1, $filename2);
        $this->assertStringEndsWith('.jpg', $filename1);
        $this->assertStringEndsWith('.jpg', $filename2);
        $this->assertStringContains('test-file', $filename1);
    }

    /** @test */
    public function it_can_process_url_metadata()
    {
        $htmlContent = '
            <html>
                <head>
                    <title>Test Page Title</title>
                    <meta name="description" content="This is a test page description">
                    <meta property="og:image" content="https://example.com/image.jpg">
                    <meta property="og:url" content="https://example.com/page">
                </head>
                <body>
                    <h1>Page Content</h1>
                </body>
            </html>
        ';

        $metadata = $this->service->extractUrlMetadata($htmlContent);

        $this->assertEquals('Test Page Title', $metadata['title']);
        $this->assertEquals('This is a test page description', $metadata['description']);
        $this->assertEquals('https://example.com/image.jpg', $metadata['image']);
        $this->assertEquals('https://example.com/page', $metadata['url']);
    }

    /** @test */
    public function it_can_clean_html_for_metadata()
    {
        $htmlContent = '
            <html>
                <head>
                    <title>   Trimmed Title   </title>
                    <meta name="description" content="Description with &amp; entities &lt;test&gt;">
                </head>
            </html>
        ';

        $metadata = $this->service->extractUrlMetadata($htmlContent);

        $this->assertEquals('Trimmed Title', $metadata['title']);
        $this->assertEquals('Description with & entities <test>', $metadata['description']);
    }

    /** @test */
    public function it_provides_default_metadata_for_missing_values()
    {
        $htmlContent = '<html><head></head><body></body></html>';

        $metadata = $this->service->extractUrlMetadata($htmlContent);

        $this->assertEquals('', $metadata['title']);
        $this->assertEquals('', $metadata['description']);
        $this->assertEquals('', $metadata['image']);
        $this->assertEquals('', $metadata['url']);
    }

    /** @test */
    public function it_can_process_content_statistics()
    {
        $content = [
            'blocks' => [
                [
                    'type' => 'paragraph',
                    'data' => [
                        'text' => 'This is the first paragraph with multiple words.'
                    ]
                ],
                [
                    'type' => 'header',
                    'data' => [
                        'text' => 'Section Header',
                        'level' => 2
                    ]
                ],
                [
                    'type' => 'list',
                    'data' => [
                        'style' => 'unordered',
                        'items' => ['Item one', 'Item two', 'Item three']
                    ]
                ]
            ]
        ];

        $stats = $this->service->getContentStatistics($content);

        $this->assertArrayHasKey('word_count', $stats);
        $this->assertArrayHasKey('character_count', $stats);
        $this->assertArrayHasKey('block_count', $stats);
        $this->assertArrayHasKey('estimated_reading_time', $stats);

        $this->assertEquals(3, $stats['block_count']);
        $this->assertGreaterThan(0, $stats['word_count']);
        $this->assertGreaterThan(0, $stats['character_count']);
        $this->assertGreaterThan(0, $stats['estimated_reading_time']);
    }
}
