# __PROJET DE CHAT EN TEMPS REEL__ ###

## <u>INSTALLATION</u> ##

Pour l'installation, il est nécessaire que Docker soit installé sur votre machine.
Suivez la documentation sur le lien suivant : https://docs.docker.com/desktop/

Avant de lancer les containers, il est obligatoire de créer le volume de la base de données sur Docker.

```shell
  $ >  Docker volume create tchat-real-time-db
```

Il vous faut configurer les variables d'environnements pour la connexion à la base de données et au serveur smtp.
Pour cela, il vous suffit d'ajouter dans le fichier ".env" du dossier '/app' :

```dotenv
DATABASE_URL="mysql://root:password@127.0.0.1:8001/db_dev?serverVersion=8.0.28"
MAILER_DSN=smtp://localhost # Mailtrap, Mailcatcher, ...
```

Si vous souhaitez un peu de contenu dans votre application, vous pouvez charger des fixtures :

```shell
  $ > make prepare-dev 
```

Dès que le volume de la base de données est créé, vous pouvez lancer les containers à partir du dossier '/app' :
```shell
  $ >  make up
```

Les serveurs sont lancés, vous pouvez vous rendre sur le site de l'application :
https://localhost:8000

Enjoy !



