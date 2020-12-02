require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const { Url, CheckUrl, GenerateShortUrl, FormatUrl} = require('./models/urls');

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl/new', (req,res) => {

  console.log('OriginalBody', req.body);

  let body = req.body;
  if(body.url === undefined || body.url === '') {
    return res.json({
      error: 'Url must be provided in the body'
    });
  }

  CheckUrl(body.url)
      .then((result) => {
        Url.findOne({url: body.url}, (err, docs) => {
          if(docs) {
            return res.json({
              original_url: docs.url,
              short_url: docs.shortUrl,
            });
          } else {
            const short = GenerateShortUrl();
            let url = new Url({
              url: FormatUrl(body.url),
              shortUrl: short,
            });
            url.save((err,data) => {
              if(err) {
                return res.json({
                  error: 'Error saving Url'
                });
              }

              return res.json({
                original_url: body.url,
                short_url: short
              })
            })
          }
        });
      })
      .catch((err) => {
        return res.json({
          error: 'invalid url'
        });
      });
});

app.get('/api/shorturl/:short_url', (req, res) => {
  Url.findOne({shortUrl: req.params.short_url}, (err, data) => {
    if(err) {
      return res.json({
        error: 'invalid url'
      });
    }
    res.redirect(FormatUrl(data.url));
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
