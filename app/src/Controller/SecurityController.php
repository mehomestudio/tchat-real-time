<?php

namespace App\Controller;

use App\Entity\User;
use App\Form\ForgottenPasswordRequestType;
use App\Form\RegistrationType;
use App\Function\TokenFunc;
use App\Repository\UserRepository;
use App\Service\FileService;
use Doctrine\Persistence\ManagerRegistry;
use Psr\Container\ContainerExceptionInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Entity;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\File;
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

            $this->addFlash('notify', [
                "type" => "success",
                "message" => "Inscription réussie, vous avez reçu un email pour vérification."
            ]);

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
        $notice = [
            "type" => "error",
            "message" => "Le token est incorrect ou expiré, vous allez recevoir un email avec un nouveau lien."
        ];

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

                $notice["type"] = "success";
                $notice["message"] = "Votre email a été vérifié avec succès !";
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

        $this->addFlash('notify', $notice);

        return $this->redirectToRoute('app_login');
    }

    #[Route('/mot-de-passe-perdu', name: 'app_forgotten_password_request')]
    public function forgottenPasswordRequest(
        Request $request,
        ManagerRegistry $manager,
        UserRepository $repo,
        MailerInterface $mailer
    ): Response
    {

        $form = $this->createForm(ForgottenPasswordRequestType::class);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid())
        {
            $identifiant = $form->get('identifiant')->getData();
            $user = $repo->findByEmailOrPseudo($identifiant);

            if ($user) {
                $token = TokenFunc::generateToken();
                $user->setForgottenPasswordToken(sha1($token));

                $manager->getManager()->persist($user);
                $manager->getManager()->flush();

                $email = (new TemplatedEmail())
                    ->to($user->getEmail())
                    ->subject('Mot de passe perdu')
                    ->htmlTemplate('emails/templates/forgotten-password.html.twig')
                    ->context([
                        'pseudo' => $user->getPseudo(),
                        'token' => $token
                    ]);

                try {
                    $mailer->send($email);
                } catch (TransportExceptionInterface $e) {
                }
            }

            $this->addFlash('notify', [
                "type" => "success",
                "message" => "Demande de réinitialisation de mot de passe réalisée avec succès, un email vous a été envoyé."
            ]);

            return $this->redirectToRoute('app_login');

        }

        return $this->render('security/forgotten-password-request.html.twig', [
            'form' => $form->createView(),
        ]);
    }

    #[Route('/mot-de-passe-perdu/{pseudo}/{token}', name: 'app_forgotten_password_reset')]
    #[Entity('user', options: ['mapping' => ['pseudo' => 'pseudo']])]
    public function forgottenPasswordReset(
        ?User $user,
        string $token,
        Request $request,
        ManagerRegistry $manager,
        MailerInterface $mailer,
        UserPasswordHasherInterface $hasher
    ): Response
    {
        if (!$user || $user->getForgottenPasswordToken() !== sha1($token)) {
            if ($user) {
                $token = TokenFunc::generateToken();
                $user->setForgottenPasswordToken(sha1($token));
                $manager->getManager()->persist($user);
                $manager->getManager()->flush();

                $email = (new TemplatedEmail())
                    ->to($user->getEmail())
                    ->subject('Mot de passe perdu')
                    ->htmlTemplate('emails/templates/forgotten-password.html.twig')
                    ->context([
                        'pseudo' => $user->getPseudo(),
                        'token' => $token
                    ]);

                try {
                    $mailer->send($email);
                } catch (TransportExceptionInterface $e) {
                }
            }

            $this->addFlash('notify', [
                "type" => "error",
                "message" => 'Token invalide ou expiré, un email contenant une nouveau lien vous a été envoyé.'
            ]);
            return $this->redirectToRoute('app_login');
        }

        $form = $this->createForm(RegistrationType::class, $user);
        $form->remove('email');
        $form->remove('pseudo');
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $user->setPassword($hasher->hashPassword($user, $user->getPassword()))
                ->setForgottenPasswordToken(null);
            $manager->getManager()->persist($user);
            $manager->getManager()->flush();

            $email = (new TemplatedEmail())
                ->to($user->getEmail())
                ->subject('Votre mot de passe a été modifié avec succès')
                ->htmlTemplate('emails/templates/forgotten-password-success.html.twig')
                ->context([
                    'pseudo' => $user->getPseudo()
                ]);

            try {
                $mailer->send($email);
            } catch (TransportExceptionInterface $e) {
            }

            $this->addFlash('notify', [
                "type" => "success",
                "message" => 'Mot de passe modifié avec succès.'
            ]);

            return $this->redirectToRoute('app_login');
        }

        return $this->render('security/forgotten-password-reset.html.twig', [
            'form' => $form->createView(),
            'email' => $user->getEmail(),

        ]);
    }

    #[Route('/modifier-password/{pseudo}', name: 'app_password_update')]
    #[Entity('user', options: ['mapping' => ['pseudo' => 'pseudo']])]
    public function updatePassword(
        ?User $user,
        Request $request,
        ManagerRegistry $manager,
        MailerInterface $mailer,
        UserPasswordHasherInterface $hasher
    ): Response
    {
        $result = [
            "status" => false,
            "code" => -1,
            "message" => "",
            "result" => ""
        ];

        if (!$user || $user !== $this->getUser())
        {
            $result["message"] = "Une erreur s'est produite lors de la récupération du "
            . "formulaire de modification du mot de passe";
            return $this->json($result, 500);
        }

        $form = $this->createForm(RegistrationType::class, $user, [
            'action' => $this->generateUrl('app_password_update', [
                "pseudo" => $user->getPseudo()
            ])
        ]);
        $form->remove("email");
        $form->remove("pseudo");
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $user->setPassword($hasher->hashPassword($user, $user->getPassword()));
            $manager->getManager()->persist($user);
            $manager->getManager()->flush();

            $email = (new TemplatedEmail())
                ->to($user->getEmail())
                ->subject('Votre mot de passe a été modifié avec succès')
                ->htmlTemplate('emails/templates/forgotten-password-success.html.twig')
                ->context([
                    'pseudo' => $user->getPseudo()
                ]);

            try {
                $mailer->send($email);
            } catch (TransportExceptionInterface $e) {
            }

            $result["status"] = true;
            $result["code"] = 1;
            $result["message"] = "Mot de passe modifié avec succès.";

            return $this->json($result);


        }

        $result["status"] = true;
        $result["code"] = 0;
        $result["result"] = $this->renderView("home/partials/_update-password.html.twig", [
            "form" => $form->createView()
        ]);
        return $this->json($result);

    }

    /**
     * @throws ContainerExceptionInterface
     */
    #[Route('/modifier-avatar/{pseudo}', name: 'app_avatar_update', methods: ['POST'])]
    #[Entity('user', options: ['mapping' => ['pseudo' => 'pseudo']])]
    public function updateAvatar(
        ?User $user,
        Request $request,
        ManagerRegistry $manager,
        FileService $fileService
    ): Response
    {
        $result = [
            "codeStatus" => 502,
            "success" => false,
            "message" => "Une erreur s'est produite, veuillez réessayer l'opération.",
            "pathAvatarUpdated" => null
        ];

        if ($user && $user === $this->getUser()) {
            /** @var File $newAvatar */
            $newAvatar = $request->files->get('avatarFile');

            if ($newAvatar)
            {
                $uploadFile = $fileService->uploadFile(
                    $newAvatar,
                    'avatar.folder',
                    $user->getAvatar(),
                    '/^(jpg|jpeg|png){1}$/'
                );

                if ($uploadFile['success'])
                {
                    $user->setAvatar($uploadFile['path']);

                    $manager->getManager()->persist($user);
                    $manager->getManager()->flush();

                    $result['codeStatus'] = 200;
                    $result['success'] = true;
                    $result['message'] = "Votre avatar a été modifié avec succès.";
                    $result['pathAvatarUpdated'] = $user->getAvatar();
                } else {
                    $result['message'] = $uploadFile['message'];
                }
            }
        }

        return $this->json($result, $result['codeStatus']);
    }

    /**
     * @Route("/se-deconnecter", name="app_logout")
     */
    public function logout(): void
    {
        throw new \LogicException('This method can be blank - it will be intercepted by the logout key on your firewall.');
    }
}
