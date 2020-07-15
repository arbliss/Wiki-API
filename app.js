//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/wikiDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  content: {
    type: String,
  }
});

const Article = mongoose.model("Article", articleSchema);


////////////////////////Home page

app.get("/", function(req, res) {
  res.send("<h1>Wiki-API</h1>");
});

/////////////////////////Requests targeting all articles

app.route("/articles")

  .get(function(req, res) {
    Article.find({}, function(err, results) {
      if (!err) {
        res.send(results);
      } else {
        res.send(err);
      }
    });
  })

  .post(function(req, res) {
    const newArticle = new Article({
      title: req.body.title,
      content: req.body.content
    });
    newArticle.save(function(err) {
      if (!err) {
        res.redirect("/articles");
      } else {
        res.send(err);
      }
    });
  })

  .delete(function(req, res) {
    Article.deleteMany({}, function(err) {
      if (!err) {
        res.redirect("/articles");
      } else {
        res.send(err);
      }
    });
  });

//////////////////////////////////Requests targeting specific articles

app.route("/articles/:articleTitle")

  .get(function(req, res) {
    const title = req.params.articleTitle;
    Article.findOne({title: req.params.articleTitle}, function(err, foundArticle){
      if (foundArticle) {
        res.send(foundArticle);
      } else {
        res.send("No articles matching that title.");
      }
    });
  })

// Updates the entire document
  .put(function(req, res){
    Article.update(
      {title: req.params.articleTitle},
      {title: req.body.title, content: req.body.content},
      {overwrite: true},
      function(err){
        if (!err) {
          res.send("Successfully updated article.");
        } else {
          res.send("Error updating article.");
        }
      }
    );
  })


// Can update individual key/value pairs
  .patch(function(req, res){
    Article.updateOne(
      {"title": req.params.articleTitle},
      {$set: req.body},
      function(err, response){
        if (!err) {
          res.send(response);
        } else {
          res.send(err);
        }
      }
    );
  })

  .delete(function(req, res){
    Article.deleteOne(
      {"title": req.params.articleTitle},
      function(err, response){
        if (!err) {
          res.send(response);
        } else {
          res.send(err);
        }
      }
    );
  });


///////////////////////Server listen

app.listen(3000, function() {
  console.log("server running on port 3000");
});
