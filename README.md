# Eager provider / service loader for Angular 2+

This module for Angular 2+ enables your application to eager load providers if necessary.
By default Angular loads all providers in a lazy manner, i.e. only whenever they are used by other components or
services that are instantiated.
While this is actually a good thing and is desirable for the majority of the cases, sometimes you might have a valid
reason to have your provider(s) to be loaded directly.
This is the case in particular for providers that play an active role in your application, but are never referenced by
other components or providers.
For more information when this is useful and the rationale for this module see the following article: _(todo)_

## Installation

To use this module in your application, you first have to install the NPM package, which can be done using the following
command:

```
npm install angular-eager-provider-loader --save
```

When installed, this package provides an UMD bundle (`bundles/index.js`), that can be referenced from the module loader
used by your application.
For example when using [SystemJS](https://github.com/systemjs/systemjs/), add the following entries to the config file:

To the `map` option:
```
'angular-eager-provider-loader': 'node_modules/angular-eager-provider-loader/bundles/'
```

To the `packages` option:
```
'angular-eager-provider-loader': {
    main: 'index.js',
    defaultExtension: 'js'
}
```

## Usage

After having installed the NPM package and configured the module loader, you can use module within your Angular
application.
To enable eager loading for your provider(s), first find the `@NgModule` class in which the provider should be loaded.
Usually this is the same module in which the provider is defined, however it could be different module if you are
want to eagerly load a provider that is imported from another module.

Once you've found the module in which the provider should be loaded, import the `EagerProviderLoaderModule`:

```TypeScript
import { EagerProviderLoaderModule } from 'angular-eager-provider-loader';

@NgModule({
	imports: [ EagerProviderLoaderModule ]
})
export class AppModule { /* ... */ }
```

By importing the `EagerProviderLoaderModule` your application will load all providers on startup that have been
registered as a provider that should be loaded eagerly.
This can be done using the following functions:

* `eagerProviderRegistration(token: any): Provider` - Registers a previously defined provider (usually defined in
another module) for eager loading.
The result is a `Provider` which you have to add the `providers` property of the `NgModule` decorator.
* `eagerProvider(provider: Provider): Provider[]` - Registers the specified provider and marks it for eager loading. The
result is an array consisting of two providers which need to be added to the `providers` property of the `NgModule`
decorator. Use this function if you simultaneously wish to define a new provider and have it loaded eagerly.
* `eagerProviders(...providers: Provider[]): Provider[]` - Accepts an arbitrary number of providers which will be
returned as an array of providers that are marked for eager loading.

_(more documentation is coming soon)_