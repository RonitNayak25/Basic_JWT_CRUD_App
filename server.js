const express = require('express');
const logger = require('morgan');
const movies = require('./routes/movies');
const users = require('./routes/users');
const bodyParser = require('body-parser');
const mongoose = require('./config/database'); //database configuration
var jwt = require('jsonwebtoken');
const app = express();
app.set('secretKey', 'nodeRestApi'); // jwt secret token
// connection to mongodb
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/', (req, res) => {
    res.json({ "tutorial": "Build REST API with node.js" });
});
// public route
app.use('/users', users);
// private route
const validateUser = function (req, res, next) {
    jwt.verify(req.headers['x-access-token'], req.app.get('secretKey'), function (err, decoded) {
        if (err) {
            res.json({ status: "error", message: err.message, data: null });
        } else {
            req.body.userId = decoded.id;
            next();
        }
    });
}
app.use('/movies', validateUser, movies);
app.get('/favicon.ico', (req, res) => {
    res.sendStatus(204);
});

app.use((req, res, next) => {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use((err, req, res, next) => {
    console.log(err);

    if (err.status === 404)
        res.status(404).json({ message: "Not found" });
    else
        res.status(500).json({ message: "Something looks wrong :( !!!" });
});
app.listen(3000, () => {
    console.log('Node server listening on port 3000');
});