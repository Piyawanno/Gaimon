# Front-End in Gaimon

For front-end, Gaimon uses the classical pattern for the software development
in general : **Separation of Concern** called **STEP** : Style-Sheet, Template,
Event Handling and Process & Protocol. The pattern can be applied not only in
the Gaimon but also in other environment. The core of Gaimon front-end is not
a framework but a composition of small libraries running on vanilla JavaScript.
For the [BackOffice](../BackOffice.md), which is built on top of these
libraries and composed of many components, it becomes a dedicated framework.

## Why Reinvent the Thing

Not really, the only component invented for front-end development in Gaimon
is a small library called [DOMObject](DOMObject.md), which simplifies how
the generated HTML tag element can be accessed. Likewise for the back-end
development, the existing technologies will be applied e.g.
[Mustache](https://mustache.github.io/). From those libraries, utilities
and Web-UI components are built under the STEP pattern and they become
a dedicated framework.

In the designing and developing process, the component centric Web-UI
framework e.g. React.js, Vue.js, Svelte, Angular and others are in our consideration.
They, however, don't fit to the requirement for the business logic centric
application, which is the main focus of Gaimon. Unlike component centric,
where the components are the first class citizen and business logic
will be called from the components, in the business logic centric,
a [Page](Page.md) containing a specific business logic is the first class
citizen and will create or call the components by need.

## STEP

The STEP pattern is nothing new and must not be strictly followed.
It is just a guideline for the front-end development and is consisted of

- **Style Sheet** : Yes, it is just a plain CSS. To master CSS,
a developer needs skill and experience, but it doesn't dissolve the fact
that CSS is a very flexible and powerful technology.
- **Template** : Gaimon uses [Mustache](https://mustache.github.io/) as
template engine for client-side as well as server-side.
- **Event Handling** : The other simple but powerful technology in the web
is [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model).
Event handling in Gaimon is, hence, based on plain DOM. In contrast
to event handling, to query the HTML element from the document is not so
simple. Hence, Gaimon provides [DOMObject](DOMObject.md) to bind
the created HTML element from template with the event handling.
- **Process & Protocol** : Yes, it is just a plain JavaScript. For front-end
development, many people almost forget the fact that JavaScript is
a dedicated programming language and can excellently process data,
from fetching data from server with AJAX (see [Protocol](Protocol.md))
to data analysis on client-side.

It can be seen that Gaimon tries to keep everything back to the basic
and so simple as possible. This allows the framework to access
the existing technologies and resources. A developer mastering CSS
and JavaScript can directly apply the skill in Gaimon. If it is not
the case, the existing external resource can help developer
to master the skill.

The ultimate goal, we want to achieve with the STEP pattern is that
we can apply knowledge and skill of the classical software engineering
into the front-end development, which is, in our opinion, necessary
but almost forgotten. As a result, a comprehensive web-application
can be rapidly developed, components can be reused, bugs can be reduced
and the team is happy.

## Shifting Business Logic from Server to Client

Before Gaimon, we've already developed other web-application framework for
the internal use. In the prior framework, the core business logic will be
implemented in the [Controller](../Controller.md) including server-side
rendering, in which the followed problems occurred :

- The Controller becomes more and more god like. Most of the implementation
will be done in the Controller.
- Event handling on client-side has been complicated, since the event cannot
be directly handled on client-side but firstly sent to server-side and wait
for response.
- Load on server becomes the main limitation of the system.

Hence, the most business logic is shifted from the controller to the client-side.
The Controller becomes point of data access with permission control
and the Page becomes the core business logic.
With the approach, the application development is immensely accelerated,
since the developer can mainly focus on the Page with the direct interaction
with the user.

## Cross Platform UI

The developed UI can be directly used as a cross platform UI and can be
installed and deployed on Android and iOS. Since Gaimon used vanilla
JavaScript, the UI source code can be executed on top of WebView in each
operating system. Under the WebView, a native application can be created
and communicate with the UI over WebView. And hence, the power of native
library can be utilized. This approach is very simple but powerful
and can shorten the development time by magnitude in comparison to
the native approach or even the other cross platform approach not counted
on the reuse of the source code on every platform.