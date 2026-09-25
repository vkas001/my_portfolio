<?php

namespace App\Services\Integrations;

use RuntimeException;

/**
 * Raised when GitHub widget data can't be produced — carries the HTTP
 * code the controller should echo so the envelope 404s/502s correctly.
 */
class GitHubUnavailableException extends RuntimeException
{
    public function __construct(string $message, public readonly int $status, ?\Throwable $previous = null)
    {
        parent::__construct($message, $previous?->getCode() ?? 0, $previous);
    }
}
