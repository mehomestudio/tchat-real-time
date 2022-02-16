<?php

namespace App\Function;

class TokenFunc
{
    /**
     * Generate a random Token
     * @return string|null
     */
    public static function generateToken(): ?string
    {
        try {
            $token = substr(str_replace(['+', '/', '='], '', base64_encode(random_bytes(30))), 0, 20);
        } catch (\Exception $e) {
            return null;
        }
        return $token;
    }
}