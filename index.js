require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyparser = require("body-parser");
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;
const dummyDB = [];

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.use(bodyparser.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

app.post("/api/shorturl", (req, res) => {
  if (!req.body.url) {
    return res.json({ error: "invalid url" });
  }
  const url = new URL(req.body.url);

  if (
    dns.lookup(url.host, (err, address) => {
      if (err) {
        console.log(err);
        return res.json({ error: "invalid url" });
      }
      if (dummyDB.find((el) => el.original_url === req.body.url)) {
        return res.json({
          original_url: req.body.url,
          short_url: dummyDB.find((el) => el.original_url === req.body.url)
            .short_url,
        });
      }
      urlnumber = generateNextUrlNumber();
      dummyDB.push({
        original_url: req.body.url,
        short_url: urlnumber,
      });
      res.json({
        original_url: req.body.url,
        short_url: urlnumber,
      });
    })
  );
});

app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrl = req.params.short_url;
  const urlData = dummyDB.find((el) => el.short_url == shortUrl);
  if (!urlData) {
    return res.json({ error: "No short URL found for given input" });
  }
  res.redirect(urlData.original_url);
});


const generateNextUrlNumber = () => {
  if (dummyDB.length === 0) return 1;
  return Math.max(dummyDB.map((el) => el.short_url));
};
