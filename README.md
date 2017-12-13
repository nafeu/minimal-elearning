<h1><img src="http://phrakture.com/storage/uploads/githubK06f0v.png" width="72" height="72" valign="middle"/>Minimal eLearning</h1>

A proof-of-concept eLearning solution which utilizes markdown files and parses them into lecture slides with interactive quizzes.

### Features

- Convert a file written in standard `Markdown` into a set lecture or presentation slides
- Embed quiz questions with explanations and references using a simple syntax within markdown
- Markdown parsing using `Showdown.js`
- Support for mathematical notation with `MathJax`
- `.md` in-browser front-matter parsing using `js-yaml-front-matter`
- Base cross-browser compatible CSS from `HTML5 Boilerplate`

### How To Use

1. Create a file in the form `PRESENTATION_NAME.memd` and place it in the `/memd` directory where `PRESENTATION_NAME` is the name for your given lecture or presentation

2. Add `title`, `author`, `date`, `math` setting and optional `background` values as front-matter for meta regarding your presentation

```
---
title: "Example Presentation"
author: "Nafeu Nasir"
date: 2017-1-1
math: off
background: "white"
---
```

3. Beneath your front-matter, create new slides simply by separating your markdown with `+++` like so:

```
# Intro

Here is your first slide

+++

Here is your second slide

+++

Standard markdown supported.
```

4. Including the custom directive `<intro></intro>` in its own slide will generate an intro slide using the presentations `title` and `author`

```
<intro></intro>
+++
```

### Installation / Development

```
git clone https://github.com/nafeu/minimal-elearning.git
cd minimal-elearning
bower install
...
```

Run your choice of development server out of the root directory.

ie. `php -S localhost:8000` or `python -m SimpleHTTPServer 8000`