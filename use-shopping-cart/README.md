
# use-shopping-cart

> A React Hook that handles shopping cart state and logic for Stripe.

https://useshoppingcart.com


[![All Contributors](https://img.shields.io/badge/all_contributors-12-orange.svg?style=flat-square)](#contributors-) [![NPM](https://img.shields.io/npm/v/use-shopping-cart.svg)](https://www.npmjs.com/package/use-shopping-cart) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

[
![Product JSON example](/assets/products.png)
![Front-End code example](/assets/front-end.png)
![Serverless code example](/assets/serverless.png)
Click to open gist.
](https://gist.github.com/ChrisBrownie55/f4d395b104a06e8df44e009440247856)


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
  <tr>
    <td align="center"><a href="http://www.kevincunningham.co.uk"><img src="https://avatars3.githubusercontent.com/u/8320213?v=4" width="100px;" alt=""/><br /><sub><b>Kevin Cunningham</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=doingandlearning" title="Tests">⚠️</a> <a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=doingandlearning" title="Code">💻</a></td>
    <td align="center"><a href="https://ianjones.us/"><img src="https://avatars2.githubusercontent.com/u/4407263?v=4" width="100px;" alt=""/><br /><sub><b>Ian Jones</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=theianjones" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://chrisbrownie.dev/"><img src="https://avatars2.githubusercontent.com/u/19195374?v=4" width="100px;" alt=""/><br /><sub><b>Chris Brown</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=ChrisBrownie55" title="Tests">⚠️</a> <a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=ChrisBrownie55" title="Code">💻</a> <a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=ChrisBrownie55" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/dayhaysoos"><img src="https://avatars3.githubusercontent.com/u/1852675?v=4" width="100px;" alt=""/><br /><sub><b>Nick DeJesus</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=dayhaysoos" title="Code">💻</a> <a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=dayhaysoos" title="Tests">⚠️</a></td>
    <td align="center"><a href="http://shodipoayomide.com"><img src="https://avatars2.githubusercontent.com/u/20538832?v=4" width="100px;" alt=""/><br /><sub><b>Shodipo Ayomide</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=Developerayo" title="Documentation">📖</a></td>
    <td align="center"><a href="http://appbureauet.dk"><img src="https://avatars1.githubusercontent.com/u/167574?v=4" width="100px;" alt=""/><br /><sub><b>Anders Bech Mellson</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=mellson" title="Code">💻</a></td>
    <td align="center"><a href="https://thorweb.dev"><img src="https://avatars0.githubusercontent.com/u/23213994?v=4" width="100px;" alt=""/><br /><sub><b>Thor 雷神</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=thorsten-stripe" title="Documentation">📖</a> <a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=thorsten-stripe" title="Code">💻</a> <a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=thorsten-stripe" title="Tests">⚠️</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://ryan.warner.codes"><img src="https://avatars2.githubusercontent.com/u/1595979?v=4" width="100px;" alt=""/><br /><sub><b>Ryan Warner</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=RyanWarner" title="Documentation">📖</a></td>
    <td align="center"><a href="http://horacioh.com"><img src="https://avatars3.githubusercontent.com/u/725120?v=4" width="100px;" alt=""/><br /><sub><b>Horacio Herrera</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=horacioh" title="Documentation">📖</a></td>
    <td align="center"><a href="https://bdougie.live"><img src="https://avatars2.githubusercontent.com/u/5713670?v=4" width="100px;" alt=""/><br /><sub><b>Brian Douglas</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=bdougie" title="Documentation">📖</a></td>
    <td align="center"><a href="https://bdesigned.netlify.com/"><img src="https://avatars2.githubusercontent.com/u/45889730?v=4" width="100px;" alt=""/><br /><sub><b>Brittney Postma</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=brittneypostma" title="Documentation">📖</a></td>
    <td align="center"><a href="https://prince.dev"><img src="https://avatars1.githubusercontent.com/u/8431042?v=4" width="100px;" alt=""/><br /><sub><b>Prince Wilson</b></sub></a><br /><a href="https://github.com/dayhaysoos/use-shopping-cart/commits?author=maxcell" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!


## License

MIT © [dayhaysoos](https://github.com/dayhaysoos)