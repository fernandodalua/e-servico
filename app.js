const express = require('express')
const faker = require('faker')
const bodyParser = require('body-parser')
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session')
const { check, validationResult } = require('express-validator');
const app = express()
const port = process.env.PORT || 5000
const mysql = require('mysql');
const multer = require('multer');
material = [];

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
  res.render("login", {layout: "login"})
})

app.post('/authnew', function(request, response) {
	let nome = request.body.nome;
	let sobrenome = request.body.sobrenome;		
	let email = request.body.email;
	let senha = request.body.senha;

	let newUser = "INSERT INTO usuario (id_conta, nome, sobrenome, email, senha) values (1, '"+nome+"', '"+sobrenome+"', '"+email+"', '"+senha+"')";
	db.query(newUser, (error, results) => {
		if (error){
			response.send('Erro: '+error +' '+ nome +' '+ sobrenome +' '+ email);
		}else{
			response.render('login');
		}			
	});
});

app.post('/auth', function(request, response) {
	let username = request.body.username;
	let password = request.body.password;

	let userQuery = "SELECT id_usuario as id_user, id_conta, nome FROM usuario WHERE email = '"+ username +"' AND senha = '"+ password +"'";

	if (username && password) {
		db.query(userQuery, (error, results) => {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				request.session.id_user = results[0].id_user;
				request.session.id_conta = results[0].id_conta;
				account = results;

				response.render('pages/home', {account: results, layout: "layout"});
			} else {
				response.render('index');
			}
		});
	} else {
		response.render('index');
	}
});

app.post('/material-post', [		
		check('codigo').isNumeric()
	], function(request, response){
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.render('pages/materiais', {material: material, layout: "layout"});
	}
	let id_conta = request.session.id_conta;
	let codigo = request.body.codigo;
	let nome = request.body.nome;
	let custo = request.body.custo.replace(",", ".");
	let lucro = request.body.lucro.replace(",", ".");
	let venda = request.body.venda.replace(",", ".");

	if(!custo){
		custo = 0
	}
	if(!lucro){
		lucro = 0
	}
	if(!venda){
		venda = 0
	}
	
	let query = "insert into material (id_conta, codigo, nome, custo, lucro, venda) values ('"+id_conta+"', '"+codigo+"', '"+nome+"', '"+custo+"', '"+lucro+"', '"+venda+"')";
	db.query(query, (error,results) => {
		if (error) {
			response.send('Erro: ' + error + ' ' + query + ' ' + codigo + ' ' + nome);
		} else {

			query = "select id_conta, codigo, nome, format(venda, 2, 'de_DE') as venda from material where id_conta = '"+id_conta+"'";
			db.query(query, (error, results) => {
				if(error){
					response.send('Erro: ' + error);
				}else{
					material = results
					response.render('pages/materiais', {material: material, layout: "layout"});
				}
			});
		}
	});	
})

app.get('/materiais', (request, response) => {
	let id_conta = request.session.id_conta;
	query = "select id_conta, codigo, nome, format(venda, 2, 'de_DE') as venda from material where id_conta = '"+id_conta+"'";
	db.query(query, (error, results) => {
		if(error){
			response.send('Erro: ' + error);
		}else{
			material = results
			response.render('pages/materiais', {material: material, layout: "layout"});
		}
	});
})

app.get('/buttons', (req, res) => {
	res.render('pages/blank', {layout: "layout"})
})

app.get('/cards', (req, res) => {
	res.render('pages/blank', {layout: "layout"})
})

app.get('/utilities-border', (req, res) => {
  res.render('pages/blank', {layout: "layout"})  
})

app.get('/utilities-animation', (req, res) => {
  res.render('pages/blank', {layout: "layout"})  
})

app.get('/utilities-other', (req, res) => {
  res.render('pages/blank', {layout: "layout"})  
})

app.get('/charts', (req, res) => {
  res.render('pages/blank', {layout: "layout"})
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
  res.render('pages/blank', {layout: "layout"})
})

app.get('/register', (req, res) =>{
  res.render("register", {layout: "register"})
})

app.get('/forgot-password', (req, res) =>{
  res.render("forgot-password", {layout: "forgot-password"})
})

app.get('/404', (req, res) => {
  res.render('pages/blank', {layout: "layout"})
})

app.use(express.static(__dirname + '/public'))
app.listen(port, () => {
    console.log('A mágica acontece em http://localhost:' + port)
})