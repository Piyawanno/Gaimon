# Design by Coding

by Kittipong Piyawanno

Gaimon promotes the **Design by Coding** method, which we apply
in [XimpleSoft](https://www.ximplesoft.com/). The method allows us to develop
our product in **Agile** fashion.
Our team follows neither Scrum nor ExtremeProgramming.
No tools like Kanban will be used, just pure coding.
Our method is very similar to the method from 
[Allen Holub](https://holub.com/), one of the author of
[Agile Manifesto](https://agilemanifesto.org/display/000000305.html), who
has published an example
for Design by Coding via [YouTube VDO](https://www.youtube.com/watch?v=d5Y1B1cmaGQ).
The VDO is an excellent resource to get ideas about the method.
Our method requires relative high skill of software developer in the team,
since no explicit design from software architect (SA) or team lead
will be given. Each team member is assigned to develop a software component
and his task will be design, develop and test in one stop.
Communication misunderstanding, integration problem and blocking on
development process pipeline can be significantly reduced.
This document describe the principle of Design by Coding using
in our team. It is a guideline and/or a recommendation and not an obligation.

## Code as The First Class Citizen

In the development process, design document is the first thing, which must be
minimized or eliminated, if possible. It doesn't mean the complete documents
are not desirable. Other documents like user requirement, user manual,
API reference or acceptance test procedure are valuable and useful
but not the design documents. By drafting a design document, the most
information of a project is uncertain. Guessing based the expertise
oriented upon the requirements is the way of the software architect
finishing the design work. The worst result is the unimplementable design.
And it is rather the common case than the rare case. Many design documents
lead to the confusion of implementation. No design document is complete
by the first draft. And modification of the design document causes
the unpredictable side effects. We have strong opinion that the design
documents are more burden than help.

Why are the design documents drafted at the first place?
Like the design in the other kinds of engineering work, they are for the overview,
the orientation and the coordination in a project. It sketches
the main idea of the implementation and can be expanded to the details.
In the other engineering work, the procedure of the implementation
can be determined from the moment of the design decision e.g.
how the wall can be built, how the circuit can be created.
Only a little to none uncertainty stays undeclared. In the software
engineering, however, every line of code means a new procedure
must be created. If a software developer repeats himself, it means
that something was wrong. The code can be copied and/or reused from
the beginning. In other words, the uncertainty of the development
process is its core nature.

Does it mean, nothing should not be designed ever? Absolutely not!
Design is still the essential part of the software development process
and can be directly drafted in the code instead of in the explicit documents.
There are challenges by the approach :

- **Design Overview** : By coding, the implementation details must be set.
With too many details, the overview can be obscured. To prevent that,
the [clean code method](https://www.oreilly.com/library/view/clean-coder-the/9780132542913/)
and the code abstraction can be introduced. Each piece of code must be coherent.
Not all developers can create the code base complied to the requirements
all the time. It is not an issue. Once, someone is feeling to lost the overview
or the code becomes incoherent, it is time to change the code. This is,
why the process is called agile.

- **Coupling and Side Effect** : Coupling is not avoidable and sometime is desirable.
It is the biggest burden in the agile development process. With coupled
code, the modification of a part can negative effect on other parts.
We recommend to follow [SOLID Principle](https://en.wikipedia.org/wiki/SOLID).
Arjarn from [Arjarn Code](https://www.arjancodes.com/) gives a good example
for applying SOLID in Python on a
[YouTube VDO](https://www.youtube.com/watch?v=pTB30aXS77U).

- **Sequence of Development Process** : What should be implemented first?
This question is legit and difficult to answer. With design on the paper,
the question is relative easy to answer. The generic method is to implement
the software component without dependencies to the other. It is of cause
difficult to find out without the design document. No big issue,
the developer can start anywhere and implement the dependent component
backwardly. Note that, each component should be firstly implemented
in minimal form and add features only if required or necessary.

The mentioned principles or methods must not be strictly
followed. They can be used, if they suit to the team and the project.
They can be seen as a set of utilities like Gaimon, which is
designed to provide framework and tools for the agile development
process with Design by Coding as the core value. The main point
is that the design can be drafted directly with the code.
And the code itself must be always ready to be changed.
The good point about this method is that the result can be directly
and instantly tested. The test result will guide the development
process in the right direction. The catastrophe caused by misdesign
can be in early state prevented. Moreover, the functioning code
is the best media to communicate among developers. Nothing can be
misunderstood. And it is even better, if the code declares itself
without additional comments as recommended in the Clean Code principle.

The other question is, must the SA be able to code? Yes, the SA must!
Many projects fail, because they are designed by someone without
coding knowledge. This is the worst thing ever happening. The result
is so predictable that the design is, in the most case, not implementable.
In some case, it is sadly determined after the deadline.
This is also valid for the Scrum Master in Scrum.

## Design Playground

Software development is about to make mistake, find it and correct it.
It applies equally to the software design. But, how can a design
be tested, if it is written in a document? No other option than
wait until the first implementation will be released. It is a far better
option, if the design is directly implemented in the code and
directly tested.

In the Design by Coding, software testing is equivalent to design testing.
The automated testing or unit testing can be applied but not obligated to.
Gaimon provides tools for unit testing as well as functional testing.
In the Gaimon project, we prefer the functional testing over the unit testing
due to the efficiency. Once the functional is complete tested, the unit
testing becomes an overhead.

What if the implemented software component does not pass the test?
For the simplest case, the error can be debugged. In the more complicated
cases, the design must be revised. The rare but most complicated case
is the redesign. Each team member, who gets involved more or less with
the design by coding, must be ready for all situations to change.
The mentioned principles and methods in the prior chapter make the code
ready to change but not given how to change. The change process can
be achieved via [Refactoring](https://refactoring.com/).

In the case of redesign, the existing code is regularly still useful and can
be reused. Only if the requirement is totally misunderstood or the development
process is based on the false assumption, the existing code won't be useful
for the redesign. Otherwise, we recommend to move the existing code to
archive and create the new code base step by step using the existing code
as much as possible. To reduce the side effect caused by redesign,
the existing API should be kept. If the code is ready to change,
the redesign process takes mostly shorter time period than expected
and the result could be magnificent.

## Code Convention

If the code should be served as a design document, it must not be just
for the machine to interpreter, but also for the human to understand
in fact for everyone in the team in the same way. The code convention
is the obvious and cheapest tool for the purpose. Remember that
the form of the code convention is a taste, except the naming convention,
no convention form is more beautiful or uglier than the other.
A dictator in the team creates it once and will be used forever.

Although there is no good code convention form, but good code convention
practice. If the code has the followed characteristics, it means that
the team members are the excellent practitioner for the code convention:

- Nobody can tell, the code was written by who. Every single piece
of code looks the same.
- Everyone in the team can understand the code in the shortest time.

## Structural but Flexible Code-Base

Design by Coding sounds like a free-form coding at first sign.
Intuitively, the code as the result is expected to be unstructured.
It it exactly contrariwise. The highly structural code is one of
the core principles in Design by Coding. Otherwise, the code
is not readable and cannot be used as design material.
Some coding rules must be followed to ensure the result :

- **Minimum Line of Code per Code Block** : The shorter is the code,
the more it is understandable. This rule force the team to follows
the separation of concerns principle, which requires more skill to achieve.
The Line of Code Rule should be set. We recommend 20-50 line per
function or method and 200-500 line for class. The rule can be exceptionally
violated, since it has little to no impact on the functionality of the software
but on the code maintenance on the long run.
- **Minimum Numbers of Parameters** : The biggest drawback of multiple
parameters is the confusion of parameter sequence. Which one comes
first, which one later. Moreover, more parameter means more coupling.
If a function has unavoidably many parameters, it is the time to
refactor the code.
- **Separation of Concerns** : Following the "Minimum Line of Code per
Code Block" will almost automatically leads to this principle. The code
should be separated in many parts as it can be done. The difficult part
of the principle is, on which logic the code should be separated. MVC for
example is separated by capability of components. Each extension, on the
other hand, is separated by purpose. The logic can be mixed e.g. first
separated in many extensions then in each extension with MVC. It is less
important, on which logic, much more important is the consistency.
The recommendation is to create a set rules, which everyone in the team can
understand, and then apply it consistently.
- **Coupling vs. Cohesion** : This is the classical design decision to be made.
In our experience, the cohesion should be preferred in the most cases.
To support the argument, coupling should be categorized in 2 kinds :
the internal and external coupling. The internal coupling is the relation
between components in the same module and external between modules.
The external coupling should be definitely minimized, but the internal coupling
is less concerned as long as the interface between components will not
be changed. It can mostly be done by following SOLID principle especially
the "Open/Close" principle. But if coupling can be reduced without effect
on cohesion, it is the most valuable result, we could have.

Note that, the given rules force the team to create structural code
and it implies also the good design.

Although, the structurality of the code is independent from its flexibility.
But the code without a good structure e.g. spaghetti code cannot be flexible.
In some case, however, the structure of the code can cause the low
level of flexibility. Note that the flexible code is very difficult
if not then the most difficult in the coding world to achieve.
Refactoring is a tool (a design tool and not a software) for continuously
enhancement of code flexibility. The first working version of code might not
look good in aspect of flexibility. But after some iteration of code
refactoring, its flexibility can be significantly improved. Moreover, with the time
and experience by keeping refactoring the code, the first version of the
code will be automatically also improved. One day the code can be a good
flexible piece since the first time it is written. The important point is
the continuous refactoring. Many coders are afraid to change their code
due to the side effects : "Never change a running system". The counter
idiom would be "It works, I don't know how.". In the latter situation, it
is time to change by refactoring the code. To avoid or prevent the side effect
especially in the production, after code refactoring, comprehensive tests
are necessary. Hence, the test is, also in this aspect, the essential part.

## Silo vs Specialized Skill

In a team of software development, works must be distributed to the team members.
The most common way to separate work is based on the layers of the software
i.e. frontend, backend and database due to the skill of the team member.
The point of view of this method is that each developer should have
a specialized skill and can improve the skill by working the same kind of
work as much as possible. The drawback of this method is the integration
between the developed layers. It can barely work in the fist iteration of
integration and the second and the third. In some project, the integration
could take more time than the development of each part.

The other method is the silo method, where the developer must be a fullstack
developer and implement everything in a component or an extension.
The integration problem can be reduced. It is widely believed that
the fullstack developers cannot or can have difficulties to develop 
their skill by doing everything at once. The other side of the coin shows
that there are common knowledge and skills in each software layer.
A front-end developer has to know about the data structure in the
database. Otherwise, the developed user-interface will not fit to the data model.
A back-end developer has to know, how the data will be used on the 
user interface. Otherwise the processed data are useless. Moreover,
the knowledge and skill of one layer will improve the knowledge and skill
of the other layers. And the link between layers can induce the new skill
and knowledge.

Note that the most controversial layer in the discussion is the front-end.
Before we discuss further and deeper, it is must be clarified that
the discussion is not about UX/UI design, which needs a special skill and is not
much related with the coding and software system design. Here, we discuss
about the implementation of UI according to the UX/UI design.
The argument for the layered approach is the specialized skill for
the specialized **front-end framework**. This is actually a red-flag.
To work with a framework, the developer have naturally to know
the concept and API of the framework. But the common knowledge of
software development and software engineering can be generally applied.
If we cannot use the general knowledge of software engineering with the
framework, it means that the framework is not complied to it.
In the common case, if a developer has already the skill of a framework,
to learn other framework should not take much time and effort.
And no matter in which layer, the engineering behind the implementation
is more or less the same only in different context.

## Design by Coding in Gaimon

Gaimon is developed under the Design by Coding principle and
in the same time, it is also the tool supporting the principle.

### Model Design

Unlike the example VDO from Allen Holub, where he starts with the outcome
according to user requirements and develops back to the data model.
We recommend but not obligate to start with model, since the data model
is the most sensitive part of an application. It means that every part
and component must more or less depends on or is related to the data model.
The modification of model can effect on many other components and
the database structure must be altered. The drawback of starting with
the data model is that it is faraway from the user requirements and hence,
many things must be guessed. Otherwise, if a developer would like to
start with the outcome, it is also possible to start with Web UI or
controller with Gaimon.

Gaimon uses [Xerial](https://github.com/Piyawanno/Xerial) as the ORM to drive
the data model. Instead of ER diagram and/or UML diagram, the data model
can be directly designed and written into the data model. It is a descriptive
and easy to understand with all the design details including the relation
between each model and the information about the web-form. The big win
of this method is that the model can be directly used and more importantly
the model class is the single source of the truth. In many environments,
the database structure will be written in one place, the UI in the other place
and the mapping/validation of the data in somewhere else. This situation
has a high potential of bug by modifying data structure. With the data model
of Gaimon, on the other hand, almost everything about the data model can
be directly written in a single model class.

As mentioned, the modification of the data model is not desirable but
unavoidable especially in the Design by Coding. Hence, Xerial provides
also [the tool to modify data structure](https://github.com/Piyawanno/Xerial/blob/main/document/tutorial/StructureModification.md).

### Batteries Included

In the conventional design process, the system designer tries to create an overview
of the system without the complication of the implementation detail. (And a system
is not implementable, exactly because the implementation detail is not considered.)
Hence, to keep an overview and to reduce the noisy implementation detail, Gaimon
provides the common used tools and libraries. If the required tools and libraries
cannot be found neither in Gaimon nor in the [PyPI](https://pypi.org/), we recommend
the pattern to separate between the code of business logic and the utilities to
keep the overview of the code and hance the design.

### Pattern

The coding and design pattern in Gaimon covers the most use cases in the Web-Application
development at least from our experience. It means that the design pattern must
not be reinvented and many design works can be completely skipped.
Otherwise, the new designs or design patterns are also welcome.
But we recommend that the pattern of the design should be considered and extracted
to **reuse the design**.

### Ready to Change

The Web-Application written with Gaimon should be always ready to change.
With the provided tools and patterns, the code should be structured and flexible.
Hence, the developer can directly draft the idea into the code. By testing,
the developer can find out that the result matches to the user requirements or not.
If not, the quick change with low side effect can be done.
