<?php

namespace App\EventSubscriber;

use App\Entity\User;
use JetBrains\PhpStorm\ArrayShape;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Security\Core\Event\AuthenticationSuccessEvent;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;

class CheckEmailVerifiedSubscriber implements EventSubscriberInterface
{
    public function onAuthenticationSuccessEvent(AuthenticationSuccessEvent $event)
    {
        /** @var User $user */
        $user = $event->getAuthenticationToken()->getUser();

        if (!$user->getIsEmailVerified())
        {
            throw new CustomUserMessageAuthenticationException("L'Email doit être vérifié avant de pouvoir s'identifier.");
        }
    }

    #[ArrayShape([
        AuthenticationSuccessEvent::class => "string",
    ])]
    public static function getSubscribedEvents(): array
    {
        return [
            AuthenticationSuccessEvent::class => 'onAuthenticationSuccessEvent'
        ];
    }
}
