<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use JetBrains\PhpStorm\Pure;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[UniqueEntity('email', message: 'L\'email existe déjà.')]
#[UniqueEntity('pseudo', message: 'Le pseudo existe déjà.')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private int $id;

    #[ORM\Column(type: 'string', length: 180, unique: true)]
    #[Assert\NotBlank(message: 'Ce champ est obligatoire.')]
    #[Assert\Email(message: 'Format de l\'email invalide.')]
    private string $email;

    #[ORM\Column(type: 'json')]
    private array $roles = [];

    #[ORM\Column(type: 'string')]
    #[Assert\NotBlank(message: 'Ce champ est obligatoire.')]
    private string $password;

    #[ORM\Column(type: 'string', unique: true)]
    #[Assert\NotBlank(message: 'Ce champ est obligatoire.')]
    private string $pseudo;

    #[ORM\Column(type: 'string', unique: true, nullable: true)]
    private ?string $token = null;

    #[ORM\Column(type: 'string', nullable: true)]
    private ?string $avatar = null;

    #[ORM\Column(type: 'boolean')]
    private bool $isEmailVerified = false;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $tokenEmail = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $forgottenPasswordToken = null;

    #[ORM\OneToMany(mappedBy: 'author', targetEntity: Message::class, cascade: ['persist', 'remove'])]
    private Collection $messages;

    #[Pure]
    public function __construct()
    {
        $this->messages = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @deprecated since Symfony 5.3, use getUserIdentifier instead
     */
    public function getUsername(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;

        return $this;
    }

    public function getPseudo(): string
    {
        return $this->pseudo;
    }

    public function setPseudo(string $pseudo): self
    {
        $this->pseudo = $pseudo;

        return $this;
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;

        return $this;
    }

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function setToken(?string $token): self
    {
        $this->token = $token;

        return $this;
    }

    public function getAvatar(): ?string
    {
        return $this->avatar;
    }

    public function setAvatar(?string $avatar): self
    {
        $this->avatar = $avatar;

        return $this;
    }

    public function getSalt(): ?string
    {
        return null;
    }

    public function eraseCredentials()
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    public function getIsEmailVerified(): ?bool
    {
        return $this->isEmailVerified;
    }

    public function setIsEmailVerified(bool $isEmailVerified): self
    {
        $this->isEmailVerified = $isEmailVerified;

        return $this;
    }

    public function getTokenEmail(): ?string
    {
        return $this->tokenEmail;
    }

    public function setTokenEmail(?string $tokenEmail): self
    {
        $this->tokenEmail = $tokenEmail;

        return $this;
    }

    public function getForgottenPasswordToken(): ?string
    {
        return $this->forgottenPasswordToken;
    }

    public function setForgottenPasswordToken(?string $forgottenPasswordToken): self
    {
        $this->forgottenPasswordToken = $forgottenPasswordToken;

        return $this;
    }

    public function getMessages(): Collection
    {
        return $this->messages;
    }

    public function addMessage(?Message $message): self
    {
        if (!$this->messages->contains($message)) {
            $this->messages[] = $message;
            $message->setAuthor($this);
        }

        return $this;
    }

    public function removeMessage(Message $message): self
    {
        if ($this->messages->removeElement($message)) {
            // set the owning side to null (unless already changed)
            if ($message->getAuthor() === $this) {
                $message->setAuthor(null);
            }
        }

        return $this;
    }
}
