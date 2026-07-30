<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_the_application_returns_a_redirect_or_successful_response(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }
}
