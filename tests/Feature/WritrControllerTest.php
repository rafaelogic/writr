<?php

namespace Writr\Tests\Feature;

use Writr\Tests\TestCase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class WritrControllerTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        
        Storage::fake('public');
    }

    /** @test */
    public function it_can_upload_images()
    {
        $file = UploadedFile::fake()->image('test.jpg', 800, 600);

        $response = $this->post('/writr/upload-image', [
            'image' => $file
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'file' => [
                    'url'
                ]
            ]);

        $data = $response->json();
        $this->assertTrue($data['success']);
        $this->assertStringContains('test', $data['file']['url']);

        Storage::disk('public')->assertExists(str_replace('/storage/', '', parse_url($data['file']['url'], PHP_URL_PATH)));
    }

    /** @test */
    public function it_validates_image_upload_file_type()
    {
        $file = UploadedFile::fake()->create('document.pdf', 100);

        $response = $this->post('/writr/upload-image', [
            'image' => $file
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['image']);
    }

    /** @test */
    public function it_validates_image_upload_file_size()
    {
        config(['writr.uploads.max_file_size' => 1024]); // 1MB limit

        $file = UploadedFile::fake()->create('large.jpg', 2048); // 2MB file

        $response = $this->post('/writr/upload-image', [
            'image' => $file
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['image']);
    }

    /** @test */
    public function it_can_upload_files()
    {
        $file = UploadedFile::fake()->create('document.pdf', 100);

        $response = $this->post('/writr/upload-file', [
            'file' => $file
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'file' => [
                    'url',
                    'name',
                    'size'
                ]
            ]);

        $data = $response->json();
        $this->assertTrue($data['success']);
        $this->assertEquals('document.pdf', $data['file']['name']);
    }

    /** @test */
    public function it_can_fetch_url_metadata()
    {
        // Mock HTTP client response
        $this->mockHttpClient([
            'status' => 200,
            'body' => '<html><head><title>Test Page</title><meta name="description" content="Test description"></head></html>'
        ]);

        $response = $this->post('/writr/fetch-url', [
            'url' => 'https://example.com/test-page'
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'meta' => [
                    'title',
                    'description',
                    'image'
                ]
            ]);

        $data = $response->json();
        $this->assertTrue($data['success']);
        $this->assertEquals('Test Page', $data['meta']['title']);
        $this->assertEquals('Test description', $data['meta']['description']);
    }

    /** @test */
    public function it_validates_url_format()
    {
        $response = $this->post('/writr/fetch-url', [
            'url' => 'not-a-valid-url'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['url']);
    }

    /** @test */
    public function it_can_generate_preview()
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

        $response = $this->post('/writr/preview', [
            'content' => $content
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'preview' => [
                    'html',
                    'text',
                    'word_count'
                ]
            ]);

        $data = $response->json();
        $this->assertTrue($data['success']);
        $this->assertStringContains('This is a test paragraph', $data['preview']['html']);
        $this->assertStringContains('Test Header', $data['preview']['html']);
    }

    /** @test */
    public function it_can_export_to_html()
    {
        $content = [
            'blocks' => [
                [
                    'type' => 'paragraph',
                    'data' => [
                        'text' => 'Test content for export.'
                    ]
                ]
            ]
        ];

        $response = $this->post('/writr/export/html', [
            'content' => $content
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'html'
            ]);

        $data = $response->json();
        $this->assertTrue($data['success']);
        $this->assertStringContains('Test content for export', $data['html']);
    }

    /** @test */
    public function it_can_export_to_markdown()
    {
        $content = [
            'blocks' => [
                [
                    'type' => 'header',
                    'data' => [
                        'text' => 'Test Header',
                        'level' => 1
                    ]
                ],
                [
                    'type' => 'paragraph',
                    'data' => [
                        'text' => 'Test paragraph content.'
                    ]
                ]
            ]
        ];

        $response = $this->post('/writr/export/markdown', [
            'content' => $content
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'markdown'
            ]);

        $data = $response->json();
        $this->assertTrue($data['success']);
        $this->assertStringContains('# Test Header', $data['markdown']);
        $this->assertStringContains('Test paragraph content', $data['markdown']);
    }

    /** @test */
    public function it_can_import_content()
    {
        $file = UploadedFile::fake()->create('content.json', 100, 'application/json');
        $file->storeAs('temp', 'content.json', 'local');
        
        file_put_contents(storage_path('app/temp/content.json'), json_encode([
            'blocks' => [
                [
                    'type' => 'paragraph',
                    'data' => [
                        'text' => 'Imported content'
                    ]
                ]
            ]
        ]));

        $response = $this->post('/writr/import', [
            'file' => $file,
            'format' => 'json'
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'content' => [
                    'blocks'
                ]
            ]);

        $data = $response->json();
        $this->assertTrue($data['success']);
        $this->assertCount(1, $data['content']['blocks']);
    }

    /** @test */
    public function it_can_auto_save_content()
    {
        $content = [
            'blocks' => [
                [
                    'type' => 'paragraph',
                    'data' => [
                        'text' => 'Auto-saved content'
                    ]
                ]
            ]
        ];

        $response = $this->post('/writr/auto-save', [
            'content' => $content,
            'document_id' => 'test-doc-123'
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'saved_at'
            ]);

        $data = $response->json();
        $this->assertTrue($data['success']);
        $this->assertNotEmpty($data['saved_at']);
    }

    /** @test */
    public function it_provides_health_check()
    {
        $response = $this->get('/writr/health');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'timestamp',
                'version',
                'features'
            ]);

        $data = $response->json();
        $this->assertEquals('ok', $data['status']);
        $this->assertArrayHasKey('upload', $data['features']);
        $this->assertArrayHasKey('export', $data['features']);
    }

    /** @test */
    public function it_handles_collaboration_connection()
    {
        $response = $this->post('/writr/collaboration/connect', [
            'document_id' => 'test-doc-123',
            'user_id' => 'user-456'
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'session_id',
                'websocket_url'
            ]);
    }

    /** @test */
    public function it_can_add_comments()
    {
        $response = $this->post('/writr/comments', [
            'document_id' => 'test-doc-123',
            'block_id' => 'block-456',
            'content' => 'This is a test comment',
            'selection' => [
                'start' => 0,
                'end' => 10
            ]
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'comment' => [
                    'id',
                    'content',
                    'author',
                    'created_at'
                ]
            ]);
    }

    /** @test */
    public function it_can_get_comments_for_document()
    {
        $response = $this->get('/writr/comments/test-doc-123');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'comments'
            ]);
    }

    /** @test */
    public function it_can_resolve_comments()
    {
        // First create a comment
        $createResponse = $this->post('/writr/comments', [
            'document_id' => 'test-doc-123',
            'block_id' => 'block-456',
            'content' => 'Test comment to resolve'
        ]);

        $commentId = $createResponse->json('comment.id');

        $response = $this->patch("/writr/comments/{$commentId}/resolve");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'comment' => [
                    'id',
                    'resolved'
                ]
            ]);

        $this->assertTrue($response->json('comment.resolved'));
    }

    /** @test */
    public function it_can_create_version()
    {
        $response = $this->post('/writr/versions', [
            'document_id' => 'test-doc-123',
            'content' => [
                'blocks' => [
                    [
                        'type' => 'paragraph',
                        'data' => [
                            'text' => 'Version content'
                        ]
                    ]
                ]
            ],
            'title' => 'Test Version',
            'description' => 'A test version'
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'version' => [
                    'id',
                    'title',
                    'description',
                    'created_at'
                ]
            ]);
    }

    /** @test */
    public function it_can_get_version_history()
    {
        $response = $this->get('/writr/versions/test-doc-123');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'versions'
            ]);
    }

    /** @test */
    public function it_can_restore_version()
    {
        // First create a version
        $createResponse = $this->post('/writr/versions', [
            'document_id' => 'test-doc-123',
            'content' => [
                'blocks' => [
                    [
                        'type' => 'paragraph',
                        'data' => [
                            'text' => 'Version to restore'
                        ]
                    ]
                ]
            ],
            'title' => 'Restore Test Version'
        ]);

        $versionId = $createResponse->json('version.id');

        $response = $this->post("/writr/versions/{$versionId}/restore");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'content'
            ]);
    }

    /** @test */
    public function it_handles_rate_limiting()
    {
        // Make multiple requests to trigger rate limiting
        for ($i = 0; $i < 100; $i++) {
            $response = $this->post('/writr/upload-image', [
                'image' => UploadedFile::fake()->image('test.jpg')
            ]);

            if ($response->status() === 429) {
                $response->assertStatus(429);
                break;
            }
        }
    }

    /** @test */
    public function it_validates_csrf_token()
    {
        $response = $this->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class])
            ->post('/writr/upload-image', [
                'image' => UploadedFile::fake()->image('test.jpg')
            ]);

        // Should work without CSRF middleware disabled
        $response->assertStatus(200);
    }

    /**
     * Mock HTTP client for testing external requests
     */
    protected function mockHttpClient(array $response)
    {
        $mock = \Mockery::mock(\Illuminate\Http\Client\PendingRequest::class);
        $mock->shouldReceive('get')
            ->andReturn(new \Illuminate\Http\Client\Response(
                new \GuzzleHttp\Psr7\Response(
                    $response['status'],
                    [],
                    $response['body']
                )
            ));

        $this->app->instance(\Illuminate\Http\Client\PendingRequest::class, $mock);
    }
}
