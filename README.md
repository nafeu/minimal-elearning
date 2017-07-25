# Minimal eLearning

A proof-of-concept eLearning solution which utilizes markdown files and parses them into lecture slides with interactive quizzes.

### Features

- Convert a single `.md` file into a set lecture slides
- Embed quiz questions with explanations and references using a simple syntax within markdown
- Markdown parsing using `Showdown.js`
- `.md` in-browser front-matter parsing using `js-yaml-front-matter`
- Support for mathematical notation with `MathJax`
- Base cross-browser compatible CSS from `HTML5 Boilerplate`

### Installation / Development

```
git clone https://github.com/nafeu/minimal-elearning.git
cd minimal-elearning
bower install
```

Run your choice of development server out of the root directory.

ie. `php -S localhost:8000` or `python -m SimpleHTTPServer 8000`