<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

class ContactController extends Controller
{
    /**
     * Validation rules mirroring the Express zod schema:
     * name 2-100, email max 200, subject 2-150, message 10-5000.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:100'],
            'email' => ['required', 'email:rfc', 'max:200'],
            'subject' => ['required', 'string', 'min:2', 'max:150'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
            'honeypot' => [Rule::prohibitedIf(fn () => filled($request->input('honeypot')))],
        ], [
            'honeypot.prohibited' => 'Spam detected.',
        ]);

        ContactMessage::query()->create($validated);

        $this->deliver($validated);

        return response()->json([
            'ok' => true,
            'data' => [
                'ok' => true,
                'message' => "Message received — I'll get back to you soon!",
            ],
        ]);
    }

    /**
     * Dev mode logs to the Laravel log; production sends via the Mail facade
     * when MAIL_MAILER is configured (configure CONTACT_TO / CONTACT_FROM).
     */
    private function deliver(array $payload): void
    {
        if (app()->environment('production') && config('mail.default') !== 'log') {
            Mail::raw(
                $payload['message']."\n\n— {$payload['name']} ({$payload['email']})",
                function ($message) use ($payload) {
                    $message->to((string) config('mail.contact.to'))
                        ->from((string) config('mail.contact.from'), $payload['name'])
                        ->replyTo($payload['email'], $payload['name'])
                        ->subject("[portfolio] {$payload['subject']}");
                },
            );

            return;
        }

        Log::info('contact submission (dev log)', [
            'from' => "{$payload['name']} <{$payload['email']}>",
            'subject' => $payload['subject'],
            'message' => mb_substr($payload['message'], 0, 200),
        ]);
    }
}
