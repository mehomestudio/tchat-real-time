<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface as UserPasswordHasherInterfaceAlias;

class UserFixtures extends Fixture
{

    public function __construct(private UserPasswordHasherInterfaceAlias $hasher)
    {

    }

    public function load(ObjectManager $manager): void
    {
        for ($i=1; $i<=30; $i++) {
            $user = (new User())
                ->setEmail("user$i@gmail.fr")
                ->setPseudo("User$i");

            $user->setPassword(
                $this->hasher->hashPassword(
                    $user,
                    "password")
            );
            $manager->persist($user);
        }

        $manager->flush();
    }
}
