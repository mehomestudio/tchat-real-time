<?php

namespace App\EventSubscriber;

use App\Entity\User;
use App\Function\TokenFunc;
use Doctrine\Persistence\ManagerRegistry;
use JetBrains\PhpStorm\ArrayShape;
use Psr\Container\ContainerExceptionInterface;
use Psr\Container\ContainerInterface;
use Psr\Container\NotFoundExceptionInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Security\Core\Event\AuthenticationSuccessEvent;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;

class CheckEmailVerifiedSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private ManagerRegistry $manager,
        private MailerInterface $mailer,
        private ContainerInterface $container
    )
    {
    }

    /**
     * @throws ContainerExceptionInterface
     * @throws NotFoundExceptionInterface
     * @throws TransportExceptionInterface
     */
    public function onAuthenticationSuccessEvent(AuthenticationSuccessEvent $event)
    {
        /** @var User $user */
        $user = $event->getAuthenticationToken()->getUser();

        if (!$user->getIsEmailVerified())
        {
            $token = TokenFunc::generateToken();
            $user->setTokenEmail(sha1($token));
            $this->manager->getManager()->persist($user);
            $this->manager->getManager()->flush();

            $email = (new TemplatedEmail())
                ->to($user->getEmail())
                ->subject('Validation de votre adresse email')
                ->htmlTemplate('emails/templates/register.html.twig')
                ->context([
                    'pseudo' => $user->getPseudo(),
                    'token' => $token
                ]);

            $this->mailer->send($email);

            $this->container
                ->get('request_stack')
                ->getSession()
                ->getFlashBag()
                ->add('notice', 'Un email vous a été envoyé pour valider votre adresse email.');

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
