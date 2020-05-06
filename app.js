const express = require('express')
const faker = require('faker')
const bodyParser = require('body-parser')
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session')
const app = express()
const port = process.env.PORT || 5000
const mysql = require('mysql');
const multer = require('multer');

const db = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'dalua123',
	database : 'eservico'
});

app.use(session({
    secret: '1d2a3l4u5a',
    resave: true,
	saveUninitialized: true
}));

app.set('view engine', 'ejs')     // Setamos que nossa engine será o ejs
app.set('layout', 'login', 'register', 'forgot-password');
app.use(expressLayouts)           // Definimos que vamos utilizar o express-ejs-layouts na nossa aplicação
app.use(bodyParser.urlencoded())  // Com essa configuração, vamos conseguir parsear o corpo das requisições

app.get('/', (req, res) => {
  res.render('pages/home', {layout: "layout"})
})

app.post('/authnew', function(request, response) {
	let nome = request.body.nome;
	let sobrenome = request.body.sobrenome;		
	let email = request.body.email;
	let senha = request.body.senha;

	let newUser = "INSERT INTO usuario (nome, sobrenome, email, email, senha) values ('"+nome+"', '"+sobrenome+"', '"+email+"', '"+senha+"')";
	db.query(newUser, (error, results) => {
		if (error){
			response.send('Erro: '+error +' '+ nome +' '+ sobrenome +' '+ email);
		}else{
			response.render('login');
		}			
	});
});

app.get('/buttons', (req, res) => {
  res.render('pages/buttons', {layout: "layout"})
})

app.get('/cards', (req, res) => {
  res.render('pages/cards', {layout: "layout"})
})

app.get('/utilities-color', (req, res) => {
  res.render('pages/utilities-color', {layout: "layout"})  
})

app.get('/utilities-border', (req, res) => {
  res.render('pages/utilities-border', {layout: "layout"})  
})

app.get('/utilities-animation', (req, res) => {
  res.render('pages/utilities-animation', {layout: "layout"})  
})

app.get('/utilities-other', (req, res) => {
  res.render('pages/utilities-other', {layout: "layout"})  
})


app.get('/charts', (req, res) => {
  res.render('pages/charts', {layout: "layout"})
})

app.get('/blank', (req, res) => {
  res.render('pages/blank', {layout: "layout"})
})

app.get('/login', (req, res) =>{
  res.render("login", {layout: "login"})
})

app.get('/index', (req, res) => {
  res.render('pages/home', {layout: "layout"})
})

app.get('/tables', (req, res) => {
  res.render('pages/tables', {layout: "layout"})
})

app.get('/register', (req, res) =>{
  res.render("register", {layout: "register"})
})

app.get('/forgot-password', (req, res) =>{
  res.render("forgot-password", {layout: "forgot-password"})
})

app.get('/404', (req, res) => {
  res.render('pages/404', {layout: "layout"})
})

app.use(express.static(__dirname + '/public'))
app.listen(port, () => {
    console.log('A mágica acontece em http://localhost:' + port)
})