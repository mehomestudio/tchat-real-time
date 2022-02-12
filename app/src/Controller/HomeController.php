<?php

namespace App\Controller;

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
        return $this->render('home/index.html.twig', [
        ]);
    }
}
