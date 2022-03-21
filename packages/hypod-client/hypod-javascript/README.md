<p align="center">
    <a target="_blank" href="https://hypod.cloud">
        <img src="https://raw.githubusercontent.com/plurid/hypod/master/about/identity/hypod-logo.png" height="250px">
    </a>
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
    Cloud Service Client for Imagene Registry
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
+ [Packages](#packages)
+ [Codeophon](#codeophon)



## Install

run

``` bash
npm install @plurid/hypod-client
```

or

``` bash
yarn add @plurid/hypod-client
```



## Usage

Generate the `hypod` client, identify an imagene, use the imagene metadata.

``` typescript
import Hypod from '@plurid/hypod-client';


const hypod = Hypod(
    'https://hypod.registry/graphql',
    'identonym:private-token',
    {
        log: true,
    },
);

const main = async () => {
    const data = await hypod.imagene.identify('foo/boo');
    if (!data) {
        return;
    }

    await hypod.imagene.obliterate(data.id);
}

main();
```



## Packages


<a target="_blank" href="https://www.npmjs.com/package/@plurid/hypod">
    <img src="https://img.shields.io/npm/v/@plurid/hypod.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/hypod][hypod] • the server application

[hypod]: https://github.com/plurid/hypod/tree/master/packages/hypod


<a target="_blank" href="https://www.npmjs.com/package/@plurid/hypod-client">
    <img src="https://img.shields.io/npm/v/@plurid/hypod-client.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/hypod-client-javascript][hypod-client-javascript] • `JavaScript` client

[hypod-client-javascript]: https://github.com/plurid/hypod/tree/master/packages/hypod-client/hypod-javascript



## [Codeophon](https://github.com/ly3xqhl8g9/codeophon)

+ licensing: [delicense](https://github.com/ly3xqhl8g9/delicense)
+ versioning: [αver](https://github.com/ly3xqhl8g9/alpha-versioning)
