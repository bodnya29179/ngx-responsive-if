# ngx-responsive-if

![npm](https://img.shields.io/npm/v/ngx-responsive-if)
![license](https://img.shields.io/npm/l/ngx-responsive-if)
![downloads](https://img.shields.io/npm/dt/ngx-responsive-if)

An Angular structural directive for conditional rendering based on media queries.

## 💡 Example Use Cases

- Show different layouts for mobile and desktop.
- Hide elements on smaller screens.
- Change UI dynamically based on screen size.

## 🚀 Features

- 📱 Show or hide elements based on media queries
- 🔥 Works with `min-width`, `max-width`, `aspect-ratio`, and more
- ⚡ Fully reactive – updates on window resize

## 📦 Installation

```sh
npm install ngx-responsive-if
```

## 📌 Version Compatibility

To ensure compatibility with different Angular versions, install the correct package version:

| Angular Version          | Plugin Version | Supports Standalone Components | Installation Command              |
|--------------------------|----------------|--------------------------------|-----------------------------------|
| `>=16.0.0`               | `v3`           | Yes                            | `npm install ngx-responsive-if@3` |
| `>=14.0.0` and `<16.0.0` | `v2`           | Yes                            | `npm install ngx-responsive-if@2` |
| `>=8.0.0` and `<14.0.0`  | `v1`           | No                             | `npm install ngx-responsive-if@1` |

## 🛠️ Usage

You can use the directive in two ways: **Module-based** or **Standalone**.

### 1️⃣ Module-Based Approach

Import and declare the `NgxResponsiveIfModule` inside an Angular module:

```ts
import { NgxResponsiveIfModule } from 'ngx-responsive-if';

@NgModule({
  imports: [NgxResponsiveIfModule],
})
export class AppModule {}
```

Then use it in your template:

```html
<div *ngxResponsiveIf="'min-width: 600px'">
  This content is visible on screens wider than 600px.
</div>

<div *ngxResponsiveIf="'max-width: 599px'; else mobileTemplate">
  This is shown on smaller screens.
</div>

<ng-template #mobileTemplate>
  <p>Visible only on smaller screens.</p>
</ng-template>
```

### 2️⃣ Standalone Approach

You can use `NgxResponsiveIfDirective` without a module by importing it directly in a component:

```ts
import { Component } from '@angular/core';
import { NgxResponsiveIfDirective } from 'ngx-responsive-if';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [NgxResponsiveIfDirective],
  template: `
    <div *ngxResponsiveIf="'min-width: 600px'">
      This content is visible on screens wider than 600px.
    </div>
  `,
})
export class ExampleComponent {}
```

This approach is useful when working with standalone components in Angular 14+.

Choose the method that best fits your project structure! 🚀

## 🔧 strictMode

The `strictMode` property defines how media queries are validated.

- **`true` (default)**: Allows only predefined media query formats.

  **Supported queries in strict mode**:
  - `min-width: Xpx`
  - `max-width: Xpx`
  - `min-height: Xpx`
  - `max-height: Xpx`
  - `aspect-ratio: X/Y`
  - `orientation: portrait`
  - `orientation: landscape`

  **Allowed CSS units**:
  - `px`
  - `rem`
  - `em`
  - `vw`
  - `dvw`
  - `vh`
  - `dvh`

- **`false`**: Accepts any valid media query string without validation.

  **Usage format**:

  Convert a CSS media query into the directive's syntax as follows:

  `@media <your condition> {}` -> `*ngxResponsiveIf="'<your condition>'"`

  **Examples**:

  1. Convert:
     ```css
     @media screen and (min-width: 40rem) {
       /* Some styles here */
     }
     ```
     to:
     ```html
     <some-html-element *ngxResponsiveIf="'screen and (min-width: 40rem)'"></some-html-element>
     ```

  2. Convert:
     ```css
     @media (max-width: 50rem) {
       /* Some styles here */
     }
     ```
     to:
     ```html
     <!-- IMPORTANT: Ensure the condition includes parentheses if required -->
     <!-- In enabled strict mode, we do not need parentheses -->
     <some-html-element *ngxResponsiveIf="'(max-width: 50rem)'"></some-html-element>
     ```

### Examples:

```html
<div *ngxResponsiveIf="'screen and (min-width: 40em)'; strictMode: false">
  This content is visible when the width is at least 40em (without strict validation).
</div>

<div *ngxResponsiveIf="'screen and (min-width: 30em) and (max-width: 50em)'; strictMode: false">
  This content is displayed when the width is between 30em and 50em.
</div>

<div *ngxResponsiveIf="'(max-width: 37.4rem)'; strictMode: false; else mobileTemplate">
  This content is displayed on smaller screens.
</div>

<div *ngxResponsiveIf="'(max-width: 20vw)'; else mobileTemplate; strictMode: false">
  This content appears when the width is at most 20vw.
</div>

<ng-template #mobileTemplate>
  <p>Visible only on smaller screens.</p>
</ng-template>
```
