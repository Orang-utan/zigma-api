# Zigma API

An API for Zigma app.

## Get Started

```
$ yarn install
$ yarn start
```

## To Deploy

CI/CD is not yet available because Azure needs an organization to deploy from Github. Hence, you will need to deploy this app via local git. Refer to [this guide](https://dev.to/bashirk/the-painless-way-to-deploying-your-nodejs-app-on-azure-part-2-5151).

```
$ git remote set-url deploy https://zigma.scm.azurewebsites.net:443/zigma.git
$ git push deploy master
```
