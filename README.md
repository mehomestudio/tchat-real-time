# __PROJET DE CHAT EN TEMPS REEL__ ###

## <u>INSTALLATION</u> ##

Pour l'installation, il est nécessaire que Docker soit installé sur votre machine.
Suivez la documentation sur le lien suivant : https://docs.docker.com/desktop/

Avant de lancer les containers, il est obligatoire de créer le volume de la base de données sur Docker.

```shell
  $ >  docker volume create tchat-real-time-db
```

Il vous faut configurer les variables d'environnements pour la connexion à la base de données et au serveur smtp.
Pour cela, il vous suffit d'ajouter dans le fichier ".env" du dossier '/app' :

```dotenv
DATABASE_URL="mysql://root:password@mysql:8001/db_dev?serverVersion=8.0.28"
MAILER_DSN=smtp://localhost # Mailtrap, Mailcatcher, ...
```

Dès que le volume de la base de données est créé et la configuration des variables d'environnement réalisée,
vous pouvez lancer les containers à partir du dossier '/app' :

<u>Utilisation du Makerfile</u> :
```shell
  $ >  make up
```

<u>Sans l'utilisation du Makerfile</u> :
```shell
  $ >  docker-compose up -d --build
```

Les serveurs sont lancés, il est nécessaire de créer la base de données.
Vous devez dans un premier vous connecter au container de l'application :
```shell
  $ > docker-compose run php bash
```
Une fois connecté au container, deux possibilités :

1. <u>Création de la base de données sans fixtures</u>
```shell
  $ > symfony console c:c
  $ > symfony console d:d:c --env=dev
  $ > symfony console d:s:u -f --env=dev
```
2. <u>Création de la base de données avec fixtures</u>
```shell
  $ > make prepare-dev
```
- Email : __user1@gmail.fr__ à __user30@gmail.fr__
- Mot de passe : __password__

Enjoy !