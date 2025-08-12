<?php

namespace Rafaelogic\Writr\Tests;

use Orchestra\Testbench\TestCase as OrchestraTestCase;
use Rafaelogic\Writr\WritrServiceProvider;

abstract class TestCase extends OrchestraTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        
        // Additional setup
    }

    protected function getPackageProviders($app)
    {
        return [
            WritrServiceProvider::class,
        ];
    }

    protected function getEnvironmentSetUp($app)
    {
        // Setup test environment
        $app['config']->set('app.key', 'base64:' . base64_encode(random_bytes(32)));
        $app['config']->set('database.default', 'testing');
        $app['config']->set('database.connections.testing', [
            'driver' => 'sqlite',
            'database' => ':memory:',
            'prefix' => '',
        ]);
    }
}
