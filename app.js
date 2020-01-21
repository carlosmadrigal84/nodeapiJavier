var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').__express);

// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use('/pdf', express.static(path.join(__dirname, '/mnt/sda3/images/pdfs')));



/**
 * Setup de i18n
 */
const i18n = require('./lib/i18nConfigure')();
app.use(i18n.init);

// console.log(i18n.__('EXAMPLE'));

/**
 * Conexión con la base de datos
 */
const mongooseConnection = require('./lib/connectMongoose');
require('./models/Agente');

app.use((req, res, next) => {
  // Una de 2 cosas:
  //   - Responder
  // res.send('ok');
  //   - O llamar a next
  //console.log('Peticion a', req.originalUrl);
  // next(new Error('cosa mala'));
  // Si os da error: Cannot set headers after they are sent to the client
  //  Significa que habéis respondido 2 o más veces
  next();
});

/**
 * Rutas de mi API
 */
const loginController = require('./routes/loginController');
const jwtAuth = require('./lib/jwtAuth');

app.use('/apiv1/agentes', jwtAuth(), require('./routes/apiv1/agentes'));
app.post('/apiv1/login', loginController.loginJWT);

app.locals.title = 'NodeAPI';

/**
 * Inicializamos y cargamos la sesion del usuario que hace la petición
 */
app.use(session({
  name: 'nodeapi-session',
  secret: 'kshd fsa78f6sd78f6s8d7f6dsa8fsjghdagfjhasdfs78',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true, // solo mandar por HTTPS
    maxAge: 1000 * 60 * 60 * 24 * 2 // caducar a los 2 días de inactividad
  },
  store: new MongoStore({
    // le pasamos como conectarse a la base de datos
    mongooseConnection: mongooseConnection
  })
}));

// middleware para tener acceso a la sesión en las vistas
app.use((req, res ,next) => {
  res.locals.session = req.session;
  next();
});

/**
 * Rutas de mi aplicación web
 */

const sessionAuth = require('./lib/sessionAuth');
const privadoController = require('./routes/privadoController');

app.use('/',         require('./routes/index'));
app.use('/services', require('./routes/services'));
app.use('/change-locale', require('./routes/change-locale'));
app.use('/users',    require('./routes/users'));
// usamos el estilo de COntroladores para estructurar las rutas siguientes:
app.get('/login', loginController.index);
app.post('/login', loginController.post);
app.get('/logout', loginController.logout);
//  sessionAuth('admin') --> devulveme un middleware que valide el rol admin
app.get('/privado', sessionAuth('admin'), privadoController.index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // comprobar error de validación
  if (err.array) { // error de validación
    err.status = 422;
    const errInfo = err.array({ onlyFirstError: true })[0];
    err.message = isAPI(req) ?
      { message: 'Nor valid', errors: err.mapped()} :
      `Not valid - ${errInfo.param} ${errInfo.msg}`;
  }

  res.status(err.status || 500);

  if (isAPI(req)) {
    res.json({ success: false, error: err.message });
    return;
  }

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.render('error');
});

function isAPI(req) {
  return req.originalUrl.indexOf('/apiv') === 0;
}

module.exports = app;
