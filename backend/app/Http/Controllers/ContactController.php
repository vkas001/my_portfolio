<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactRequest;
use App\Services\Contact\ContactService;
use Illuminate\Http\JsonResponse;

class ContactController extends Controller
{
    public function __construct(private readonly ContactService $contact) {}

    /**
     * Returns the plain payload; ApiResponseEnvelope wraps it, so the wire
     * shape is `{ ok: true, data: { message } }` — matching shared
     * ContactResponse. (Previously this double-wrapped ok/data.)
     */
    public function store(StoreContactRequest $request): JsonResponse
    {
        return response()->json($this->contact->submit($request->validated()));
    }
}
