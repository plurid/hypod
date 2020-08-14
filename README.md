<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/hypod/master/about/identity/hypod-logo.png" height="250px">
    <br />
    <a target="_blank" href="https://github.com/plurid/hypod/blob/master/LICENSE">
        <img src="https://img.shields.io/badge/license-MIT-blue.svg?colorB=1380C3&style=for-the-badge" alt="License: MIT">
    </a>
</p>



<h1 align="center">
    hypod
</h1>


<h3 align="center">
    Cloud-Native Imagene Registry
</h1>



`hypod` is an imagene registry.

An `imagene registry` is a renaming of the `container registry` because, in fact, the registry is one of 'images', a runnable package, not of 'containers', a running package, and because a software 'image' is a bad name since there is nothing visual about it's nature.

The name `hypod` comes from the appropriation of the greek `hupodochê`, receptacle, as discussed in Plato's [`Timaeus`](https://plato.stanford.edu/entries/plato-timaeus/).



### Contents

+ [Install](#install)
+ [Usage](#usage)
+ [Building](#building)
+ [Packages](#packages)



## Install

run

``` bash
npm install @plurid/hypod
```

or

``` bash
yarn add @plurid/hypod
```

create a `server.js` file

``` typescript
import hypod from '@plurid/hypod';


const hypod = new hypod();

hypod.start();
```

and run it

``` bash
node server.js
```

`hypod` starts a server listening on port `56565` serving the hypod UI on `/`, or which can receive GraphQL API requests on `/graphql`.



## Usage



## Building

``` bash
docker build --file ./configurations/production.dockerfile \
    --tag hypod \
    --build-arg HYPOD_PORT= \
    --build-arg HYPOD_QUIET= \
    --build-arg HYPOD_DOCKER_REALM_BASE= \
    --build-arg HYPOD_DOCKER_SERVICE= \
    --build-arg HYPOD_DATABASE_TYPE= \
    --build-arg HYPOD_STORAGE_TYPE= \
    --build-arg HYPOD_STORAGE_BUCKET= \
    --build-arg HYPOD_STORAGE_ROOT_PATH= \
    --build-arg HYPOD_PRIVATE_OWNER_IDENTONYM= \
    --build-arg HYPOD_PRIVATE_OWNER_KEY= \
    --build-arg HYPOD_PRIVATE_TOKEN= \
    --build-arg HYPOD_AWS_API_VERSION= \
    --build-arg HYPOD_AWS_REGION= \
    --build-arg HYPOD_AWS_ACCESS_KEY_ID= \
    --build-arg HYPOD_AWS_SECRET_ACCESS_KEY= \
    --build-arg GOOGLE_APPLICATION_CREDENTIALS= \
    --build-arg HYPOD_CUSTOM_LOGIC= \
    --build-arg HYPOD_PRIVATE_USAGE= \
    --build-arg HYPOD_PRIVATE_OWNER_IDENTONYM= \
    --build-arg HYPOD_PRIVATE_OWNER_KEY= \
    --build-arg HYPOD_PRIVATE_TOKEN= \
    .
```



## Packages


<a target="_blank" href="https://www.npmjs.com/package/@plurid/hypod">
    <img src="https://img.shields.io/npm/v/@plurid/hypod.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/hypod][hypod] • the server application

[hypod]: https://github.com/plurid/hypod/tree/master/packages/hypod
