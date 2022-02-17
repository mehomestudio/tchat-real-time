<?php

namespace App\Controller;

use App\Entity\User;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class HomeController extends AbstractController
{
    #[Route('/', name: 'home')]
    #[isGranted('IS_AUTHENTICATED_FULLY')]
    public function index(): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        return $this->render('home/index.html.twig', [
        ]);
    }

    #[Route('/ws/token-ws/get', name: 'ws_get_token', methods: ["GET"])]
    #[isGranted('IS_AUTHENTICATED_FULLY')]
    public function getTokenWs(): Response
    {
        /** @var User $user */
        $user = $this->getUser();

        if (null === $user->getToken())
        {
            return $this->redirectToRoute("app_logout");
        }

        return $this->json([
            "tokenws" => $user->getToken()
        ]);
    }
}
