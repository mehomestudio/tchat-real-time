<?php

namespace App\Form;

use App\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\RepeatedType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Regex;

class RegistrationType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add("email", null, [
                "label" => "Email",
                "attr" => [
                    "placeholder" => "Votre E-mail"
                ]
            ])
            ->add("pseudo", null, [
                "label" => "Pseudo",
                "attr" => [
                    "placeholder" => "Choisissez un Pseudo"
                ]
            ])
            ->add("password", RepeatedType::class, [
                "type" => PasswordType::class,
                "invalid_message" => "Les mots de passe ne sont pas identiques.",
                "first_options" => [
                    "label" => "Mot de passe",
                    "attr" => [
                        "placeholder" => "Mot de passe"
                    ]
                ],
                "second_options" => [
                    "label" => "Conformation mot de passe",
                    "attr" => [
                        "placeholder" => "Confirmation mot de passe"
                    ]
                ],
                "constraints" => [
                    new Regex(
                        '/([\w.\-!*$@+\/]){8,16}$/',
                        'Le mot de passe doit contenir entre 8 et 16 caractères. (caractères autorisés : .!*$@+/-)'
                    )
                ]
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => User::class,
        ]);
    }
}
