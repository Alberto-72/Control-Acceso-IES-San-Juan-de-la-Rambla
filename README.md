# Control-Acceso-IES-San-Juan-de-la-Rambla
Este repositorio va a alojar el proyecto intermodular final de DAM


INSTALACIONES NECESARIAS PARA EL EXPO

 node install express 
 Npm install react-native-nfc-manager    
 npm install express cors odoo-xmlrpc
 npm install react-native-safe-area-context


 Tras hacer esto, puede que haya que eliminar la carpeta android porque es así de especial la caché
 por lo tanto, hay que ejecutar "Remove-Item -Recurse -Force android" o se borra a mano

 Se vuelve a construir con npx expo prebuild -p android  

 Y después hay que hacer
 - cd .\android\
 - .\gradlew.bat clean

Para dejar la app minimamente funcionando, hay que ejecutar en una consola "node server.js"
En otra consola npx expo start 
y en otra npx expo run:android teniendo un android conectado
