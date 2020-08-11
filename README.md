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
    + [Setup](#setup)
    + [Command-Line Interface](#command-line-interface)
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

hypod starts a server listening on port `56565` serving the hypod UI on `/`, or which can receive GraphQL API requests on `/api`.



## Usage

1. docker build given the appropriate file with the appropriate tag

2. docker push the created image



### Setup

### Command-Line Interface

Options:

    -v, --version                   output the version number

    -h, --help                      display help for command

Commands:



## Packages


<a target="_blank" href="https://www.npmjs.com/package/@plurid/hypod">
    <img src="https://img.shields.io/npm/v/@plurid/hypod.svg?logo=npm&colorB=1380C3&style=for-the-badge" alt="Version">
</a>

[@plurid/hypod][hypod] • the server application

[hypod]: https://github.com/plurid/hypod/tree/master/packages/hypod
