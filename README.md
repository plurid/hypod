<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/hypod/master/about/identity/hypod-logo.png" height="250px">
    <br />
    <br />
    <a target="_blank" href="https://github.com/plurid/hypod/blob/master/LICENSE">
        <img src="https://img.shields.io/badge/license-DEL-blue.svg?colorB=1380C3&style=for-the-badge" alt="License: DEL">
    </a>
</p>



<h1 align="center">
    hypod
</h1>


<h3 align="center">
    Cloud-Native Imagene Registry
</h3>



<br />



`hypod` is an imagene registry.

An `imagene registry` is a renaming of the `container registry` because, in fact, the registry is one of 'images', a runnable package, not of 'containers', a running package, and because a software 'image' is a bad name since there is nothing visual about it's nature.

The name `hypod` comes from the appropriation of the greek `hupodochê`, receptacle, as discussed in Plato's [`Timaeus`](https://plato.stanford.edu/entries/plato-timaeus/).

`hypod` uses [plurid](https://github.com/plurid/plurid) to explore information as a 3D structure.


<p align="center">
    <img src="https://raw.githubusercontent.com/plurid/hypod/master/about/screenshots/ss-1.png" height="500px">
</p>


### Contents

+ [Install](#install)
+ [Usage](#usage)
+ [Building](#building)
+ [Configuration](#configuration)
+ [Packages](#packages)
+ [Codeophon](#codeophon)



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
// server.js
import hypodServer, {
    hypodSetup,
} from '@plurid/hypod';


hypodSetup();
hypodServer.start();
```

and run it

``` bash
node server.js
```

`hypod` starts a server listening on port `56565` serving the hypod UI on `/`, or which can receive GraphQL API requests on `/graphql`.



## Usage

`hypod` can be used as

+ a completely public registry;
+ a completely private registry (with only one owner);
+ a registry with multiple owning accounts (requires custom logic);

In order to use `hypod` as a multi-owned registry the custom logic needs to implement the [`HypodLogic` interface](https://github.com/plurid/hypod/blob/84661ba76a53ad72abea712c4938fa8db0eea6b2/packages/hypod/source/server/data/interfaces/index.ts#L108z) and pass the methods to `hypodSetup` before starting the `hypodServer`


``` typescript
// server.js
import hypodServer, {
    hypodSetup,
    HypodLogic,
} from '@plurid/hypod';


const hypodLogic: HypodLogic = {
    // ...
};

hypodSetup(hypodLogic);
hypodServer.start();
```



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



## Configuration

`hypod` can be configured to use

as a database:

+ the `filesystem`
+ `amazon` database
+ `google` database

as storage:

+ the `filesystem`
+ `amazon` storage
+ `google` storage



## Packages


<a target="_blank" href="https://www.npmjs.com/package/@plurid/hypod">
    <img src="https://img.shields.io/npm/v/@plurid/hypod.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/hypod][hypod] • the server application

[hypod]: https://github.com/plurid/hypod/tree/master/packages/hypod



## [Codeophon](https://github.com/ly3xqhl8g9/codeophon)

+ licensing: [delicense](https://github.com/ly3xqhl8g9/delicense)
+ versioning: [αver](https://github.com/ly3xqhl8g9/alpha-versioning)
