<?php

namespace App\EventSubscriber;

use App\Entity\User;
use App\Function\TokenFunc;
use Doctrine\Persistence\ManagerRegistry;
use JetBrains\PhpStorm\ArrayShape;
use JetBrains\PhpStorm\NoReturn;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
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
        $token = TokenFunc::generateToken();

        while ($token && $this->manager->getRepository(User::class)->findOneBy(["token" => $token]))
        {
            $token = TokenFunc::generateToken();
        }

        if ($token)
        {
            $user->setToken(sha1($token));
            $this->manager->getManager()->persist($user);
            $this->manager->getManager()->flush();
        }
    }

    #[NoReturn]
    public function onLogoutEvent(LogoutEvent $event)
    {
        /** @var User $user */
        $user = $event->getToken()->getUser();
        if ($user->getToken() !== null)
        {
            $user->setToken(null);
            $this->manager->getManager()->persist($user);
            $this->manager->getManager()->flush();
        }
    }

    #[ArrayShape([
        LoginSuccessEvent::class => "string",
        LogoutEvent::class => "string",
    ])]
    public static function getSubscribedEvents(): array
    {
        return [
            LoginSuccessEvent::class => 'onLoginSuccessEvent',
            LogoutEvent::class => 'onLogoutEvent',
        ];
    }
}
