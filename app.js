
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var app = express();


//连接数据库
mongoose.connect('mongodb://localhost/homework1',function(err){
	if (!err) {
		console.log('connected to mongodb');
	}else
	{throw err;}
});

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Blog = new Schema(
	{
	 author:String,
	 content:String,
	 createTime : { type: Date, default: Date.now }
	});
var Blog = mongoose.model('Blog', Blog);


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//启用会话
app.use(express.cookieParser());
app.use(express.session({secret: 'OZhCLfxlGp9TtzSXmJtq'}));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);


app.get('/blog', function(req, res){
  Blog.find({}, function (err, docs) {
    res.render('blog/index', {
      title: 'blog index view',
      docs: docs
    });
  });
});
app.get('/blog/new', function(req, res){
  res.render('blog/new.jade', {
    title: 'New saying view'
  });
});
app.post('/blog', function(req, res){
  var blog = new Blog({
  	author:req.body.author,
  	content:req.body.content
  });
  blog.save(function (err) {
    if (!err) {
      res.redirect('/blog');
    }
    else {
      res.redirect('/blog/new');
    }
  });
});

app.get('/blog/:id/edit', function(req, res){
  Blog.findById(req.params.id, function (err, doc){
    res.render('blog/edit', {
      title: 'Edit Task View',
      blog: doc
    });
  });
});
app.put('/blog/:id', function(req, res){
  Blog.findById(req.params.id, function (err, doc){
    doc.updated_at = new Date();
    doc.author = req.body.author;
    doc.content = req.body.content;
    doc.save(function(err) {
      if (!err){
        res.redirect('/blog');
      }
      else {
        console.err(err);
      }
    });
  });
});


app.del('/blog/:id', function(req, res){
  Blog.findOne({ _id: req.params.id }, function(err, doc) {
    doc.remove(function() {
      res.redirect('/blog');
    });
  });
});




http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
