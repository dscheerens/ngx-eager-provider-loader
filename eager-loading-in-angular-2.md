Eager loading in Angular 2+
===========================

A nice and much talked about feature of Angular 2 is support for lazy loading.
The [official Angular documentation website](https://angular.io/docs/ts/latest/guide/router.html#asynchronous-routing) does a great job in describing it's purpose.
In short: it allows you to break up your Angular application in smaller modules that can be loaded independently and only when necessary.
This can greatly speedup application load times.
So if lazy loading is such a nice thing, why would one want to do the opposite: *eager loading*?

Lazy loading vs Eager loading
-----------------------------

To answer the question above, first you need to understand that Angular actually has two forms of lazy loading.
The first form is that of lazy module loading as briefly described in the introduction.
There is, however, a second form that all Angular applications are doing already: lazy loading of providers.
You might not even be aware of this, since this happens more under the surface.
In fact it is Angular's dependency injection (DI) framework that provides this feature.
Lazy loading is a common feature found in many DI frameworks, including that of Angular 1.

Lazy loading in terms of a DI framework basically means that dependencies will only be loaded at the moment they are actually required.
For example, if we stick to the domain of Angular, suppose you have a component that requires a service **X**.
That service **X** will only be instantiated the first time that component is displayed.
Now if you define another service **Y**, but no other service or component has a dependency on **Y**, you'll notice **Y** will never be instantiated.
Simply adding the service **Y** to the providers list of some module will not trigger the service to be instantiated.
You can easily check this yourself, by adding a breakpoint or `console.log` in the constructor of your services.
If you do so, you'll see that services are only instantiated the first time at which they are needed.

Obviously there is a good reason for the lazy loading behavior found in many DI frameworks: it can significantly reduce the initial loading time of an application.
Since lazy loading is desirable for almost all cases, it is nice that this is the default behavior.
However, there are those rare cases in which it actually becomes a problem.

This is something I've encountered several times while working on an application for a client.
For example: our team needed to add analytics and one of the events that was tracked were route changes.
We first made a service for publishing the analytics events.
Then we had to connect to the Angular router and publish the events to the analytics service.
Initially our naive solution was to inject both the Angular router and analytics service in the `AppComponent`, which is the bootstrap component for the application.
The solution looked somewhat like the following:

```TypeScript
export class AppComponent {
    constructor(router: Router, analyticsService: AnalyticsService) {
        router.events
            .filter( /* some filtering... */ )
            .map( /* some mapping... */ )
            .subscribe((event) => analyticsService.publishRouteChange(event))
    }
}
```

Right from the start, this felt like a bad solution, but we stuck to it for some time since we didn't know where else to put this 'glue' code.
We could have moved this code to the analytics service itself, but that would have made it harder to unit test this service and it also would have violated several design principles.
Over time the `AppComponent` grew bigger with more of such constructs, so it became time to tackle the beast.

The first thing we did was to move those pieces of code out of the `AppComponent` into their own classes.
After having created those new classes, we faced the problem of getting them instantiated.
Since they all had dependencies to other services, it made sense to use Angular's DI framework to load them.
However, simply adding them to the provider list of the `@NgModule` classes didn't work.
This was caused by the fact they were not used as a dependency by other services or components.
Hence the lazy loading feature of the DI framework was preventing them from being instantiated.
So instead of being lazy loaded, these providers needed be loaded on application startup immediately, or to put it in other words: they required *eager loading*.
In the next section, we'll look at how this can be accomplished with Angular 2 (and above).

Eager loading through module classes
------------------------------------

So the problem is, given some provider, how can we make sure Angular loads it in the absence of services or components that depend on it?
Due the the lazy loading behavior of Angular's DI framework, you have to put in some extra effort to make Angular load the provider.

Luckily the solution to the problem is quite simple: just make it a dependency!
The next problem then becomes to decide where to put this dependency: there might not be an obvious candidate.
One thing you could do is make it a dependency of the component that gets bootstrapped, e.g. in the `AppComponent` of the example shown in the previous section.
That, however, is still a bit messy and it turns out there actually a nicer solution: inject it into a module class.
This is possible since Angular will instantiate module classes and uses it's DI framework to do so, allowing you to define dependencies in the constructor of your module.
Here's an example:

```TypeScript

@NgModule({ /* ... */ })
class AppModule {
    constructor(http: Http) {
        http.get('http://www.example.com/')
            .map((response) => response.text())
            .subscribe(console.log);
    }
}
```

In the example above the `Http` service is used to fetch the resource at some URL and print it to the console on application startup.
This demonstrates that you can use DI for module classes as well.
So now that we know where to put the dependencies for providers that need eager loading, let's return to the example of the analytics service described in the previous section.
The new setup would look something like this:

```TypeScript
@Injectable()
class RouteEventPublisher {
    constructor(router: Router, analyticsService: AnalyticsService) {
        router.events
            .filter( /* some filtering... */ )
            .map( /* some mapping... */ )
            .subscribe((event) => analyticsService.publishRouteChange(event))
    }
}

@NgModule({
    providers: [AnalyticsService, RouteEventPublisher]
})
class AppModule {
    constructor(routeEventPublisher: RouteEventPublisher) {

    }
}
```

This is much cleaner than the initial solution shown in the previous section!
Should you ever need eager loading in your application, then this is the way to do it (for now).

Making things more convenient
-----------------------------

The example code above illustrates that you need to do 3 things to get providers loaded eagerly on application startup:

* They need to be decorated with the `@Injectable` decorator.
* They need to be listed in the providers list of a module.
* You have to add them as parameters to the constructor of the module.

The first two are actually required for every provider, regardless of whether you need to have eager loading for that provider or not.
This is just a requirement to make use of Angular's DI framework.
It would have been nice though if the last step could be omitted, so you only need to reference the provider just once in your module.
Maybe the Angular team could make this possible in the future by extending the `@Injectable` decorator to accept some metadata object with an option to mark it for eager loading.
Like so for example:

```TypeScript
@Injectable({ load: LoadingStrategy.Eager })
class RouteEventPublisher {
    // ...
}
```

For now, however, we have to make due without such a feature.
I therefore created a simple Angular module to make it more convenient to define eager loaded providers.
Combined with the ES6 [spread operator](https://developer.mozilla.org/nl/docs/Web/JavaScript/Reference/Operators/Spread_operator) this module makes it very easy to use eager loading.
Here's the same solution using that module:

```TypeScript
@NgModule({
    imports: [EagerProviderLoaderModule]
    providers: [AnalyticsService, ...eagerProvider(RouteEventPublisher)]
})
class AppModule {

}
```

By importing `EagerProviderLoaderModule` and declaring the provider via the `eagerProvider` function it is no longer necessary to add a constructor to your module in which you have to list all providers that need to be loaded on application startup.
Instead the `EagerProviderLoaderModule` will take care of this.
The added benefit of the `EagerProviderLoaderModule` is that it also ensures that the provider is only instantiated once when used in combination with lazy module loading.
Lazy module loading can cause problems if you use the constructor method that was outlined in the previous section, since it then loads the provider for every visit of the route that is associated with the lazy loaded module.

I have published the module as an NPM package called [angular-eager-provider-loader](https://www.npmjs.com/package/angular-eager-provider-loader) so you can use it in your own application.
Documentation is available as well.

Summary
-------

Sometimes the lazy loading behavior of Angular's dependency injection framework can work against you.
From my own experience, I found several cases where the opposite of lazy loading was required: *eager loading*.
A concrete example, discussed earlier in the article, is that of publishing route change events to an analytics service.
The classes I've encountered so far that required eager loading had the following traits in common:

* None of these classes plays the role of a conventional service, since they are not used as a dependency by other services or components.
* Instead they play a more active role in 'driving' a certain kind of (background) behavior of the application.
* Each one has one or more dependencies to other services, which justifies the use of a DI framework instead of manually instantiating the classes.

Because of the first trait, lazy loading prevents such classes from being loaded.
The trick to solve this problem is to force them to be loaded by making these classes a dependency of another class that gets loaded via the DI framework on application startup.
As shown, this can be done by adding them to the constructor of classes with the `@NgModule` decorator, which is the most logical place to define these dependencies.

To make eager loading easier to setup and more robust when combined with lazy loaded modules, I create the [angular-eager-provider-loader](https://github.com/dscheerens/angular-eager-provider-loader) module for Angular 2 (and beyond).
The module is published as an NPM package so you can use it within your own application if you also have a need for eager loading.
