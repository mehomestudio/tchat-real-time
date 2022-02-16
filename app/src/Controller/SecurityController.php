<?php

namespace App\Controller;

use App\Entity\User;
use App\Form\RegistrationType;
use App\Function\TokenFunc;
use App\Repository\UserRepository;
use Doctrine\Persistence\ManagerRegistry;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

class SecurityController extends AbstractController
{
    /**
     * @Route("/se-connecter", name="app_login")
     */
    public function login(AuthenticationUtils $authenticationUtils): Response
    {
        if ($this->getUser()) {
         return $this->redirectToRoute('home');
        }

        // get the login error if there is one
        $error = $authenticationUtils->getLastAuthenticationError();
        // last username entered by the user
        $lastUsername = $authenticationUtils->getLastUsername();

        return $this->render('security/login.html.twig', [
            'last_username' => $lastUsername,
            'error' => $error
        ]);
    }

    #[Route('/inscription', name: 'app_register')]
    public function register(
        Request $request,
        ManagerRegistry $manager,
        UserPasswordHasherInterface $hasher,
        MailerInterface $mailer
    ): Response
    {
        if ($this->getUser()) {
            return $this->redirectToRoute('home');
        }

        $user = new User();
        $form = $this->createForm(RegistrationType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid())
        {
            $token = TokenFunc::generateToken();
            $user
                ->setPassword($hasher->hashPassword($user, $user->getPassword()))
                ->setTokenEmail(sha1($token));
            $manager->getManager()->persist($user);
            $manager->getManager()->flush();

            $email = (new TemplatedEmail())
                ->to($user->getEmail())
                ->subject('Validation de votre adresse email')
                ->htmlTemplate('emails/templates/register.html.twig')
                ->context([
                    'pseudo' => $user->getPseudo(),
                    'token' => $token
                ]);

            try {
                $mailer->send($email);
            } catch (TransportExceptionInterface $e) {
            }

            $this->addFlash('notice', 'Inscription réussie, vous avez reçu un email pour vérification.');

            return $this->redirectToRoute('app_login');
        }

        return $this->render('security/register.html.twig', [
            'form' => $form->createView()
        ]);
    }

    #[Route('/email/verified/{pseudo}/{token}', name: 'app_email_verified')]
    #[Entity('user', options: ['mapping' => ['pseudo' => 'pseudo']])]
    public function verifiedEmail(
        ?User $user,
        string $token,
        ManagerRegistry $manager,
        MailerInterface $mailer
    ): Response
    {
        $notice = 'Le token est incorrect ou expiré, vous allez recevoir un email avec un nouveau lien.';

        if ($user) {
            $htmlTemplate = "email-verified-success.html.twig";
            $subject = 'Validation de votre adresse email';
            $context = [
                'pseudo' => $user->getPseudo()
            ];

            if ($user->getTokenEmail() === sha1($token)) {
                $user
                    ->setTokenEmail(null)
                    ->setIsEmailVerified(true);

                $notice = "Votre email a été vérifié avec succès !";
            } else {
                $token = TokenFunc::generateToken();
                $user->setTokenEmail(sha1($token));

                $subject = "Vérification de l'email échouée.";
                $htmlTemplate = "email-verified-failed.html.twig";
                $context['token'] = $token;

            }
            $manager->getManager()->persist($user);
            $manager->getManager()->flush();

            $email = (new TemplatedEmail())
                ->to($user->getEmail())
                ->subject($subject)
                ->htmlTemplate('emails/templates/'.$htmlTemplate)
                ->context($context);

            try {
                $mailer->send($email);
            } catch (TransportExceptionInterface $e) {
            }

        }

        $this->addFlash('notice', $notice);

        return $this->redirectToRoute('app_login');
    }

    /**
     * @Route("/logout", name="app_logout")
     */
    public function logout(): void
    {
        throw new \LogicException('This method can be blank - it will be intercepted by the logout key on your firewall.');
    }
}
