<?php

namespace Tests\Feature;

class BlogFeedTest extends AdminApiTestCase
{
    private function seedPost(array $overrides): void
    {
        $this->postJson('/api/admin/blogs', array_merge([
            'id' => 'post-'.uniqid(),
            'title' => 'A post',
            'excerpt' => 'A teaser.',
            'body' => 'Hello world.',
            'tags' => ['general'],
            'published' => true,
        ], $overrides), $this->adminHeaders())->assertOk();
    }

    public function test_rss_feed_lists_published_only_with_escaped_content(): void
    {
        $this->seedPost([
            'id' => 'rss-ship',
            'title' => 'Shipping <fast> & often',
            'excerpt' => 'Why small batches win.',
            'tags' => ['shipping', 'craft'],
        ]);
        $this->seedPost(['id' => 'rss-draft', 'title' => 'Hidden draft', 'published' => false]);

        $res = $this->get('/api/blogs/rss')->assertOk();
        $this->assertSame('application/rss+xml; charset=utf-8', $res->headers->get('Content-Type'));

        $xml = $res->getContent();
        $this->assertStringContainsString('<rss version="2.0">', $xml);
        $this->assertStringContainsString('Shipping &lt;fast&gt; &amp; often', $xml);
        $this->assertStringContainsString('<category>shipping</category>', $xml);
        $this->assertStringNotContainsString('Hidden draft', $xml);

        $doc = new \DOMDocument;
        $this->assertTrue($doc->loadXML($xml));
        $this->assertSame(1, $doc->getElementsByTagName('item')->length);
    }

    public function test_rss_feed_without_posts_is_a_valid_empty_channel(): void
    {
        $res = $this->get('/api/blogs/rss')->assertOk();

        $doc = new \DOMDocument;
        $this->assertTrue($doc->loadXML($res->getContent()));
        $this->assertSame(0, $doc->getElementsByTagName('item')->length);
    }

    public function test_long_cover_url_survives_the_widened_column(): void
    {
        // Regression: validation allowed 2048 chars while cover_url was
        // VARCHAR(255) — MySQL failed the save with SQLSTATE 22001.
        $long = 'https://www.google.com/imgres?q='.str_repeat('x', 460);
        $this->assertGreaterThan(255, strlen($long));

        $this->postJson('/api/admin/blogs', [
            'id' => 'blog-longurl',
            'title' => 'Long cover',
            'body' => 'Body.',
            'coverUrl' => $long,
            'published' => false,
        ], $this->adminHeaders())->assertOk()
            ->assertJsonPath('data.coverUrl', $long);
    }
}
