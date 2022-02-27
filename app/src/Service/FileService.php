<?php

namespace App\Service;

use Exception;
use JetBrains\PhpStorm\ArrayShape;
use Psr\Container\ContainerExceptionInterface;
use Psr\Container\ContainerInterface;
use Psr\Container\NotFoundExceptionInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ContainerBagInterface;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Contracts\Service\ServiceSubscriberInterface;

class FileService implements ServiceSubscriberInterface
{
    public function __construct(private ContainerInterface $container)
    {

    }

    /**
     * @param File $file
     * @param string $folderName
     * @param string $regex
     * @param string|null $deleteOldFile
     * @param int $size
     * @return array
     * @throws ContainerExceptionInterface
     * @throws Exception
     */
    #[ArrayShape(["success" => "bool", "message" => "string", "path" => "string"])]
    public function uploadFile(
        File $file,
        string $folderName,
        string $deleteOldFile = null,
        string $regex = '/a*/',
        int $size = 1000000
    ): array
    {
        $message = "Une erreur s'est produite lors de la récupération de l'image.";
        $success = false;
        $path = "";

        if (
            $file->getSize() <= $size &&
            preg_match($regex, strtolower($file->guessExtension()))
        )
        {
            try {
                $publicPath = $this->container->get('parameter_bag')->get('public_path');
                $folder = $this->container->get('parameter_bag')->get($folderName);
                $ext = $file->guessExtension() ?? 'bin';
                $filename = bin2hex(random_bytes(10)).'.'.$ext;
                $file->move($publicPath.$folder, $filename);
                $path = $folder.'/'.$filename;

                if ($deleteOldFile)
                {
                    if (file_exists($publicPath.$deleteOldFile))
                    {
                        unlink($publicPath.$deleteOldFile);
                    }
                }

                $success = true;
                $message = "Le fichier a été enregistrer avec succès.";
            } catch (NotFoundExceptionInterface $e) {
                return [
                    "success" => $success,
                    "message" => $message,
                    "path" => $path
                ];
            }
        }
        else
        {
            $message = ($file->getSize() > $size) ?
                "Votre image fait ".(number_format($file->getSize()/1000000, 2))." MB. La limite est de 1 MB." :
                "";
            $message .= !preg_match($regex, strtolower($file->guessExtension())) ?
                ($message !== "" ? "\n" : "") .
                "Le format de l'image n'est pas pris en charge (autorisés : PNG|JPG)." :
                "";
        }

        return [
            "success" => $success,
            "message" => $message,
            "path" => $path
        ];
    }

    #[ArrayShape(['parameter_bag' => "string"])]
    public static function getSubscribedServices(): array
    {
        return [
            'parameter_bag' => '?'.ContainerBagInterface::class,
        ];
    }
}