# Proyecto de ejemplo usando el SDK de Webpay de Node.js
El siguiente proyecto es un ejemplo simple de Webpay a través del SDK de Transbank para Node.js.

Es una aplicación web que usa `express` para montar un servidor local, en el que se utiliza el SDK de Node.js de Webpay 
para implementar los diferentes productos de Webpay, de manera que los integradores puedan revisar ejemplos de uso. 

## Requerimientos
Para ejecutar el proyecto es necesario tener: 
- [docker y docker-compose](https://docs.docker.com/install/)
- [Node.js](https://nodejs.org/en/)

## Ejecutar ejemplo
Con el código fuente del proyecto en tu computador, puedes ejecutar en la raíz del proyecto los siguientes pasos:

### 1. Instalar dependencias
Para instalar las dependencia puedes ejecutar el siguiente comando en tu consola:
```bash
npm install
```
### 2. Ejecutar ejemplo
```bash 
node src/index.js
```
La aplicación se ejecutará en [http://localhost:3000](http://localhost:3000) (y fallará en caso de que el puerto 3000 no esté disponible)



© 2020 GitHub, Inc.
