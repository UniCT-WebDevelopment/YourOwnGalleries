# A brief history

The project represented the conclusion of the academic subject **Web programming, design & usability** of the three-year degree course in **Computer Science of the University of Catania**. It was developed using the **Angular 8** framework for the frontend and the **Laravel 5.8** framework for the backend; in particular, Laravel exposes the use APIs that are called from the frontend with the help of **RxJS** library.

The application presents itself as an online gallery manager with the possibility of sharing galleries and individual images/videos contained in them. User authentication is based on **JWT** (JSON Web Token).

# Usage

## Prerequisites

You need to have a version of [PHP](https://www.php.net/downloads.php) >= 7.1.3 and [MySQL Server](https://dev.mysql.com/downloads/mysql/) >= 5.7 installed on your system (**support for JSON columns**); you also need to enable followings PHP extensions inside the **php.ini** file:

- php_curl
- php_fileinfo
- php_gd2
- php_intl
- php_mbstring
- php_exif
- php_mysqli
- php_openssl
- php_pdo_mysql
- php_soap
- php_xmlrpc

After making the pull, the entire application contained in the **dist** folder requires the download of dependencies via [composer](https://getcomposer.org/) using the command

```
composer install
```

## <a id="env-conf"></a> .env file configuration

It is necessary to rename the **dist/.env.example** file to **.env** to then configure (at least) the interaction with the MySQL database, previously created, and with the email address that will automatically send the regenerated passwords for the users to them.

## Application encryption key and JWT secret generation

The application needs an encryption key and a JWT secret (used for tokens generation) that can be added to **dist/.env** using

```
php artisan key:generate
php artisan jwt:secret
```

## Angular frontend build

The uncompiled version of the frontend is available in the **Angular frontend** folder and can be modified and built using **Angular CLI** (it is already present locally as dependency); you need to have an installation of [Node.JS](https://nodejs.org/it/) on the system to install dependencies using

```
npm install
```

The new build can now be performed and placed in **Angular frontend/dist** using the command

```
ng build --prod=true|false
```

To serve the new build, place the index.html file in **dist/resources/views** and the rest of the files in **dist/public**, taking care not to delete **index.php** and **.htaccess** files there.

# Execution

## <a id="migrations"></a> Migrations

Taking care of [.env](#env-conf), you will have to start by filling a previously created database using the command

```
php artisan migrate
```

which will create the tables represented by the migrations contained in **dist/database/migrations**.

## Serve

Application can be served from **dist** folder running the command

```
php artisan serve --port=8000
```

Port 8000 is needed because it is used in the frontend.

# Laravel APIs

## APIs without authentication

These are APIs that don't need user authentication.

|     API      | Method | Description                                                    | Body                                |
| :----------: | ------ | -------------------------------------------------------------- | ----------------------------------- |
|  api/signin  | POST   | Manage login with credentials and return the JWT token         | {email, password}                   |
| api/register | POST   | Manage the registration of a new user                          | {name, email, password, c_password} |
|  api/forgot  | POST   | Manage password recovery and sending e-mail with the new one\* | {email}                             |
| api/refresh  | GET    | Allow the refresh of an expired JWT token\*\*                  |                                     |

\*Take care of [.env](#env-conf).

\*\*It needs expired **Bearer** token as **Authorization** header.

## APIs with authentication

These are APIs available only for registered and authenticated users; it is necessary to provide the JWT **Bearer** token in the **Authorization** header of the request.

| API                | Method | Description                                                |
| ------------------ | ------ | ---------------------------------------------------------- |
| api/signout        | DELETE | Manage logout of a user with invalidation of the JWT token |
| api/unregistration | DELETE | Manage the unsubscription of a previously registered user  |

## APIs with Role-Based Authentication

These are APIs dedicated to a specific role associated with the user; role and authentication are checked using JWT token that must be provided in the request as seen above.

### Standard user

| API                                        | Method | Description                                                                                                           | Body                                                         |
| ------------------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| api/home/user?offset=OFFSET&limit=LIMIT    | POST   | Get featured content for the user                                                                                     |                                                              |
| api/password/check                         | POST   | Check the password even outside the signin                                                                            | {password}                                                   |
| api/registration/update                    | POST   | Update user information                                                                                               | {email, name, password, c_password}, every field is optional |
| api/galleries?page=PAGE&search=SEARCH      | GET    | Obtain (with pagination) the galleries owned by the user or shared with him using search criteria                     |                                                              |
| api/galleries/{id}?page=PAGE&search=SEARCH | GET    | Obtain (with pagination) the informations concerning the elements contained in the gallery "id" using search criteria |                                                              |
| api/galleries/create                       | POST   | Create a new gallery                                                                                                  | {name}                                                       |
| api/galleries/delete/{id}                  | DELETE | Remove the gallery "id" and all the associated elements                                                               |                                                              |
| api/galleries/rename/{id}                  | PUT    | Rename the gallery "id"                                                                                               | {name}                                                       |
| api/galleries/download/{id}                | GET    | Start downloading the gallery "id" as .zip archive                                                                    |                                                              |
| api/items/{id}                             | GET    | Get the image/video "id" resource                                                                                     |                                                              |
| api/items/thumbnails/{id}                  | GET    | Get the thumbnail associated with the resource "id"                                                                   |                                                              |
| api/items/upload/{gallery_id}              | POST   | Upload a new item, after processing and thumb generation, in the gallery "gallery_id"                                 | {file} as FormData                                           |
| api/items/download/{id}                    | GET    | Start downloading the "id" resource                                                                                   |                                                              |
| api/items/delete/{id}                      | DELETE | Delete the resource "id"                                                                                              |                                                              |
| api/items/rename/{id}                      | PUT    | Rename the resource "id"                                                                                              | {name}                                                       |
| api/share/galleries/{id}                   | POST   | Make gallery "id" shared and generate shareable link                                                                  |                                                              |
| api/share/items/{id}                       | POST   | Make resource "id" shared and generate shareable link                                                                 |                                                              |
| api/share/galleries/{token}                | GET    | Get the shared gallery identified by token                                                                            |                                                              |
| api/share/items/{token}                    | GET    | Get the shared resource identified by token                                                                           |                                                              |
| api/unshare/galleries/{token}              | DELETE | Make the gallery associated with the token private again                                                              |                                                              |
| api/unshare/items/{token}                  | DELETE | Make the resource associated with the token private again                                                             |                                                              |
| api/storages                               | GET    | Get the description of available storage plans                                                                        |                                                              |
| api/storage                                | GET    | Get the description of the current storage plan and the space used                                                    |                                                              |
| api/storage/change/{new_id}                | PUT    | Upgrade to the storage plan identified by new_id                                                                      |                                                              |

### Administrator user

For the moment we have only one example API.

| API           | Type | Description                                               |
| ------------- | ---- | --------------------------------------------------------- |
| api/home/user | POST | Get the featured content for the admin user (coming soon) |

## Notes

A future refactoring definitely contemplates the aggregation of many APIs via Route::resource() and the remodeling of the Laravel controllers as RESTful controllers, as well as the possible reassessment of HTTP methods used.

# Angular frontend

## The routes

| Route         | Description                                                                                                       |
| ------------- | ----------------------------------------------------------------------------------------------------------------- |
| access/signin | Collect user data for login                                                                                       |
| access/signup | Collect data of the new user for registration                                                                     |
| access/forgot | Use the user's email to send regenerated password                                                                 |
| home          | Show user highlighted content allowing deletion/renaming/sharing                                                  |
| galleries     | Show user galleries (owned or shared with him) and allow to delete/rename/download/share/create/add new galleries |
| gallery/:name | Show the contents of the gallery name and allows deleting/downloading/sharing/renaming on it                      |
| settings      | Show settings (user data for the moment) and update them                                                          |
| storage       | Show current storage plan, used space and upgrades available                                                      |

## Features

- Responsiveness (best effort)
- Support for .jpg and .mp4 files
- Sharing of galleries via links
- Sharing of images/videos via links
- Download galleries as .zip archives
- Search for galleries and items
- Purchases of larger storage plans\*
- Authentication with JWT and automatic renewal\*\*

The images are processed in the backend with the support of [Intervention](http://image.intervention.io/) library for generation of thumbnails and rotation of the images based on **EXIF** data.

\***dist/storage/app/uploads** is the storage folder.

\*\*Token has a validity of 6 hours configurable in the file **dist/config/jwt.php**; automatic renewal is managed by intercepting all http calls in the frontend using Angular interceptor.
