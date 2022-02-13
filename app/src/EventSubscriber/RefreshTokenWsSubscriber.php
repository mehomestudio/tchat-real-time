<?php

namespace App\EventSubscriber;

use App\Entity\User;
use Doctrine\Persistence\ManagerRegistry;
use JetBrains\PhpStorm\ArrayShape;
use JetBrains\PhpStorm\NoReturn;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\Security\Http\Event\LoginSuccessEvent;
use Symfony\Component\Security\Http\Event\LogoutEvent;

class RefreshTokenWsSubscriber implements EventSubscriberInterface
{
    public function __construct(private ManagerRegistry $manager)
    {
    }

    public function onLoginSuccessEvent(LoginSuccessEvent $event)
    {
        /** @var User $user */
        $user = $event->getUser();
        $token = $this->refreshToken();
        while ($this->manager->getRepository(User::class)->findOneBy(["token" => $token]))
        {
            $token = $this->refreshToken();
        }

        $user->setToken(sha1($token));
        $this->manager->getManager()->persist($user);
        $this->manager->getManager()->flush();
    }

    #[NoReturn]
    public function onLogoutEvent(LogoutEvent $event)
    {
        /** @var User $user */
        $user = $event->getToken()->getUser();
        $user->setToken(null);
        $this->manager->getManager()->persist($user);
        $this->manager->getManager()->flush();
    }

    private function refreshToken(): string
    {
        try {
            $token = substr(str_replace(['+', '/', '='], '', base64_encode(random_bytes(30))), 0, 20);
        } catch (\Exception $e) {
            throw new BadRequestException("Une erreur s'est produite, veuillez réaliser à nouveau l'opération.");
        }
        return $token;
    }

    #[ArrayShape([
        LoginSuccessEvent::class => "string",
        LogoutEvent::class => "string"
    ])]
    public static function getSubscribedEvents(): array
    {
        return [
            LoginSuccessEvent::class => 'onLoginSuccessEvent',
            LogoutEvent::class => 'onLogoutEvent'
        ];
    }
}
