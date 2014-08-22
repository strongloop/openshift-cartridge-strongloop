var seqCount = 0;
var usedIds = {};
var makeUnique = {
  'index.html': true,
  'style.css': true,
  'script.js': true,
  'unit.js': true,
  'spec.js': true,
  'scenario.js': true
};

function ids(list) {
  return list.map(function(item) { return item.id; }).join(' ');
};


exports.Example = function(scenarios) {
  this.module = '';
  this.deps = ['angular.js'];
  this.html = [];
  this.css = [];
  this.js = [];
  this.unit = [];
  this.scenario = [];
  this.scenarios = scenarios;
};

exports.Example.prototype.setModule = function(module) {
  if (module) {
    this.module = module;
  }
};

exports.Example.prototype.addDeps = function(deps) {
  deps && deps.split(/[\s\,]/).forEach(function(dep) {
    if (dep) {
      this.deps.push(dep);
    }
  }, this);
};

exports.Example.prototype.addSource = function(name, content) {
  var ext = name == 'scenario.js' ? 'scenario' : name.split('.')[1],
      id = name;

  if (makeUnique[name] && usedIds[id]) {
    id = name + '-' + (seqCount++);
  }
  usedIds[id] = true;

  this[ext].push({name: name, content: content, id: id});
  if (name.match(/\.js$/) && name !== 'spec.js' && name !== 'unit.js' && name != 'scenario.js') {
    this.deps.push(name);
  }
  if (ext == 'scenario') {
    this.scenarios = this.scenarios || [];
    this.scenarios.push(content);
  }
};

exports.Example.prototype.toHtml = function() {
  return '<h2>Source</h2>\n' +
          this.toHtmlEdit() +
          this.toHtmlTabs() +
          '<h2>Demo</h2>\n' +
          this.toHtmlEmbed();
};


exports.Example.prototype.toHtmlEdit = function() {
  var out = [];
  out.push('<div source-edit="' + this.module + '"');
  out.push(' source-edit-deps="' + this.deps.join(' ') + '"');
  out.push(' source-edit-html="' + ids(this.html) + '"');
  out.push(' source-edit-css="' + ids(this.css) + '"');
  out.push(' source-edit-js="' + ids(this.js) + '"');
  out.push(' source-edit-unit="' + ids(this.unit) + '"');
  out.push(' source-edit-scenario="' + ids(this.scenario) + '"');
  out.push('></div>\n');
  return out.join('');
};

exports.Example.prototype.toHtmlTabs = function() {
  var out = [],
      self = this;

  out.push('<tabset>');
  htmlTabs(this.html);
  htmlTabs(this.css);
  htmlTabs(this.js);
  htmlTabs(this.unit);
  htmlTabs(this.scenario);
  out.push('</tabset>');
  return out.join('');

  function htmlTabs(sources) {
    sources.forEach(function(source) {
      var fileType = source.name.match(/[^\.]+$/),
          name = source.name;
      fileType = fileType[0];
      if (name == 'scenario.js') name = 'End to end test';

      out.push(
        '<tab select="highlight()" heading="' + name + '">\n' +
          '<source-viewer file-type="' + fileType + '">' + source.content + '</source-viewer></tab>\n');
    });
  }
};

exports.Example.prototype.toHtmlEmbed = function() {
  var out = [];
  out.push('<script type="text/plain" example-runner class="ng-hide">'); //<div class="well doc-example-live"');
  
  var jsonDump = {
      module: this.module,
      html: this.html,
      js: this.js,
      css: this.css
  };
  out.push(JSON.stringify(jsonDump));
  out.push('</script>');

  return out.join('');
};


