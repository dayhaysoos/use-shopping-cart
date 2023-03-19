# use-shopping-cart
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-16-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

[![NPM](https://img.shields.io/npm/v/use-shopping-cart.svg?style=flat-square)](https://www.npmjs.com/package/use-shopping-cart)

> A React Hook that handles shopping cart state and logic for Stripe.

https://useshoppingcart.com

[
![Product JSON example](/assets/products.png)
![Front-End code example](/assets/front-end.png)
![Serverless code example](/assets/serverless.png)
Click to open gist.
](https://gist.github.com/andria-dev/f4d395b104a06e8df44e009440247856)

## Documentation

[View our comprehensive documentation website.](https://useshoppingcart.com) ✨📚

## Frequently Asked Questions

This is a list of questions that you might have about use-shopping-cart once you get started.

### Why am I getting an error about `formatToParts` not being a `function` on older browsers?

You need to polyfill `formatToParts` if you want to support older browsers. You can find more [info on manually polyfilling `formatToParts` in issue #158](https://github.com/dayhaysoos/use-shopping-cart/issues/158).

### Why am I getting an SSR error about text content not matching?

It is likely that you are using a value like `cartCount` that is loaded from LocalStorage which doesn't exist on the server. More info in [issue #122](https://github.com/dayhaysoos/use-shopping-cart/issues/122)

## Contributing to use-shopping-cart

If you're working on this project **please check out
[the CONTRIBUTING.md file](https://github.com/dayhaysoos/use-shopping-cart/blob/master/use-shopping-cart/CONTRIBUTING.md)**.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://www.kevincunningham.co.uk"><img src="https://avatars3.githubusercontent.com/u/8320213?v=4?s=100" width="100px;" alt="Kevin Cunningham"/><br /><sub><b>Kevin Cunningham</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=doingandlearning" title="Tests">⚠️</a> <a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=doingandlearning" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://ianjones.us/"><img src="https://avatars2.githubusercontent.com/u/4407263?v=4?s=100" width="100px;" alt="Ian Jones"/><br /><sub><b>Ian Jones</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=theianjones" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/dayhaysoos"><img src="https://avatars3.githubusercontent.com/u/1852675?v=4?s=100" width="100px;" alt="Nick DeJesus"/><br /><sub><b>Nick DeJesus</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=dayhaysoos" title="Tests">⚠️</a> <a href="#blog-dayhaysoos" title="Blogposts">📝</a> <a href="#business-dayhaysoos" title="Business development">💼</a> <a href="https://github.com/dayhaysoos/use-shopping-cart/issues?q=author%3Adayhaysoos" title="Bug reports">🐛</a> <a href="#data-dayhaysoos" title="Data">🔣</a> <a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=dayhaysoos" title="Documentation">📖</a> <a href="#fundingFinding-dayhaysoos" title="Funding Finding">🔍</a> <a href="#infra-dayhaysoos" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#projectManagement-dayhaysoos" title="Project Management">📆</a> <a href="#question-dayhaysoos" title="Answering Questions">💬</a> <a href="https://github.com/dayhaysoos/use-shopping-cart/pulls?q=is%3Apr+reviewed-by%3Adayhaysoos" title="Reviewed Pull Requests">👀</a> <a href="#security-dayhaysoos" title="Security">🛡️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://shodipoayomide.com"><img src="https://avatars2.githubusercontent.com/u/20538832?v=4?s=100" width="100px;" alt="Shodipo Ayomide"/><br /><sub><b>Shodipo Ayomide</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=Developerayo" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://appbureauet.dk"><img src="https://avatars1.githubusercontent.com/u/167574?v=4?s=100" width="100px;" alt="Anders Bech Mellson"/><br /><sub><b>Anders Bech Mellson</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=mellson" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://thorweb.dev"><img src="https://avatars0.githubusercontent.com/u/23213994?v=4?s=100" width="100px;" alt="Thor 雷神"/><br /><sub><b>Thor 雷神</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=thorsten-stripe" title="Documentation">📖</a> <a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=thorsten-stripe" title="Code">💻</a> <a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=thorsten-stripe" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://ryan.warner.codes"><img src="https://avatars2.githubusercontent.com/u/1595979?v=4?s=100" width="100px;" alt="Ryan Warner"/><br /><sub><b>Ryan Warner</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=RyanWarner" title="Documentation">📖</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://horacioh.com"><img src="https://avatars3.githubusercontent.com/u/725120?v=4?s=100" width="100px;" alt="Horacio Herrera"/><br /><sub><b>Horacio Herrera</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=horacioh" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://bdougie.live"><img src="https://avatars2.githubusercontent.com/u/5713670?v=4?s=100" width="100px;" alt="Brian Douglas"/><br /><sub><b>Brian Douglas</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=bdougie" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://bdesigned.netlify.com/"><img src="https://avatars2.githubusercontent.com/u/45889730?v=4?s=100" width="100px;" alt="Brittney Postma"/><br /><sub><b>Brittney Postma</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=brittneypostma" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://prince.dev"><img src="https://avatars1.githubusercontent.com/u/8431042?v=4?s=100" width="100px;" alt="Prince Wilson"/><br /><sub><b>Prince Wilson</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=maxcell" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.erichowey.dev/"><img src="https://avatars.githubusercontent.com/u/204841?v=4?s=100" width="100px;" alt="Eric Howey"/><br /><sub><b>Eric Howey</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=ehowey" title="Documentation">📖</a> <a href="#plugin-ehowey" title="Plugin/utility libraries">🔌</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/hideokamoto-stripe"><img src="https://avatars.githubusercontent.com/u/95597878?v=4?s=100" width="100px;" alt="Hidetaka Okamoto"/><br /><sub><b>Hidetaka Okamoto</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=hideokamoto-stripe" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/andria-dev"><img src="https://avatars.githubusercontent.com/u/19195374?v=4?s=100" width="100px;" alt="Andria Brown"/><br /><sub><b>Andria Brown</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=andria-dev" title="Tests">⚠️</a> <a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=andria-dev" title="Code">💻</a> <a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=andria-dev" title="Documentation">📖</a> <a href="https://github.com/dayhaysoos/use-shopping-cart/issues?q=author%3Aandria-dev" title="Bug reports">🐛</a> <a href="#example-andria-dev" title="Examples">💡</a> <a href="#infra-andria-dev" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-andria-dev" title="Maintenance">🚧</a> <a href="#ideas-andria-dev" title="Ideas, Planning, & Feedback">🤔</a> <a href="#question-andria-dev" title="Answering Questions">💬</a> <a href="https://github.com/dayhaysoos/use-shopping-cart/pulls?q=is%3Apr+reviewed-by%3Aandria-dev" title="Reviewed Pull Requests">👀</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://konnorrogers.com"><img src="https://avatars.githubusercontent.com/u/26425882?v=4?s=100" width="100px;" alt="Konnor Rogers"/><br /><sub><b>Konnor Rogers</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=KonnorRogers" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/larissapissurno"><img src="https://avatars.githubusercontent.com/u/8760873?v=4?s=100" width="100px;" alt="Larissa Pissurno"/><br /><sub><b>Larissa Pissurno</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=larissapissurno" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## License

MIT © [dayhaysoos](https://github.com/dayhaysoos)
