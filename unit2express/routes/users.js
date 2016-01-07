var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/*', function(req, res, next) {
  res.send("My name is : " + req.url.substr(1,req.url.length));
});

module.exports = router;
