# Clone de Instagram.

## Funcionalidades del Sistema.
Este es un clone de Instagram el cual contiene las principales funcionalidades de este. En esta aplicación el usuario tendrá que registrarse para obtener su perfil y poder acceder. Una vez el usuario inicie sesión podrá acceder a la pantalla principal donde podrá ver todas las publicaciones que fueron realizadas por otros usuarios. El usuario podrá dejarle un comentario y dar me gusta a las publicaciones de otros usuarios. Cuando ingrese a la pantalla de perfil este podrá ver y editar toda su información de la cuenta. También podrá ver, crear, editar y eliminar sus las publicaciones que serán vistas por los demás usuarios. Por otra parte, la aplicación cuenta con un buscador en la parte superior donde puede buscar las personas por su nombre de usuario y acceder a sus perfiles para ver su contenido. Por ultimo y no menos importante el usuario puede cambiar su clave accediendo a la opción de cambiar contraseña que se encuentra en el menú situado en la esquina superior derecha.

## Herramientas Utilizadas.
- HTML.
- CSS.
- JavaScript.
- Firebase.
- SweetAlert.
- Live Server.

## Pasos para configurar el proyecto.

#### Acceder desde la URL.
- Puedes acceder a la aplicacion utilizando el siguiente link [Instagram-clone.](https://neshgogo.github.io/instagram-clone/)

#### Descargar proyecto y utilizarlo local.
1. Clonar el repostirorio.
2. Instalar NodeJS.
3. Ejecutar el comando `npm update` en la carpeta del proyecto.
4. Ejecutar el comando `npm run start` y automaticamente se abrira el navegador con la aplicacion.

#### Utilizar tu propio sevicio de Firebase.
1. Clonar el repostirorio.
2. ingresar a [firebase](https://firebase.google.com/) y te autenticas.
3. Accede a la consola y pulsa en agregar un proyecto.
4. Registra la APP haciendo clic en el icono de web.
5. Copia la configuracion de firebase que esta dentro del objeto llamado firebaseConfig.
6. Pega esta configuracion en el archivo env/environment.js en la propiedad que se llama firebaseConfig.
7. Ir a la consola de firebase y en el proyecto inicializa cloud fireStore.
8. En las reglas de cloud fireStore remueve el allow anterior y agrega `allow read, write: if request.auth != null;`.
9. Inicializa el servicio de storage.
10. En las reglas del storage remueve el allow anterior y agrega las siguientes dos lineas `allow read: if request.auth == null;` `allow read, write: if request.auth != null;`
11. Inicializa el servicio de Authentication y en la opcion de metodo de login habilita correo electronico y contraseña.
12. Descargar y instalar NodeJS. Puedes descargarlo [aqui.](https://nodejs.org/es/)
13. Ejecutar el comando `npm update` en la carpeta del proyecto.
14. Ejecutar el comando `npm run start` y automaticamente se abrira el navegador con la aplicacion.
