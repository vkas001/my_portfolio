<?php

namespace App\Services\Contact;

use App\Models\ContactMessage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mime\Address;

/**
 * Persist + deliver contact submissions. Dev mode logs; production sends
 * via the Mail facade when MAIL_MAILER is configured (CONTACT_TO/At:FROM).
 * The endpoint itself is additionally throttled (throttle:contact).
 */
class ContactService
{
    /** @return array{message: string} the payload the frontend reads. */
    public function submit(array $data): array
    {
        ContactMessage::query()->create($data);

        $this->deliver($data);

        return ['message' => "Message received — I'll get back to you soon!"];
    }

    private function deliver(array $payload): void
    {
        if (app()->environment('production') && config('mail.default') !== 'log') {
            Mail::raw(
                $payload['message']."\n\n— {$payload['name']} ({$payload['email']})",
                function ($message) use ($payload) {
                    $message->to((string) config('services.contact.to'))
                        // CONTACT_FROM may be a full "Name <addr>" mailbox —
                        // Address::create parses it; passing the raw string as
                        // the address produced an invalid From header.
                        ->from(Address::create((string) config('services.contact.from')))
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
