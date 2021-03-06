const express = require('express')
const faker = require('faker')
const bodyParser = require('body-parser')
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session')
const { check, validationResult } = require('express-validator')
const app = express()
const port = process.env.PORT || 5000
const mysql = require('mysql')
const multer = require('multer')
material = []
cliente = []
itens = []
orcamento = []

const db = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'dalua123',
	database : 'eservico'
})

app.use(session({
    secret: '1d2a3l4u5a',
    resave: true,
	saveUninitialized: true
}))

app.set('view engine', 'ejs')     // Setamos que nossa engine será o ejs
app.set('layout', 'login', 'register', 'forgot-password', 'print')
app.use(expressLayouts)           // Definimos que vamos utilizar o express-ejs-layouts na nossa aplicação
app.use(bodyParser.urlencoded())  // Com essa configuração, vamos conseguir parsear o corpo das requisições

app.get('/', (req, res) => {
  res.render("login", {layout: "login"})
})

app.post('/authnew', function(request, response) {
	let nome = request.body.nome
	let sobrenome = request.body.sobrenome
	let email = request.body.email
	let senha = request.body.senha

	let newUser = "INSERT INTO usuario (id_conta, nome, sobrenome, email, senha) values (1, '"+nome+"', '"+sobrenome+"', '"+email+"', '"+senha+"')"
	db.query(newUser, (error, results) => {
		if (error){
			response.send('Erro: '+error +' '+ nome +' '+ sobrenome +' '+ email)
		}else{
			response.render('login')
		}			
	})
})

app.post('/auth', function(request, response) {
	let username = request.body.username
	let password = request.body.password

	let userQuery = "SELECT id_usuario as id_user, id_conta, nome FROM usuario WHERE email = '"+ username +"' AND senha = '"+ password +"'"

	if (username && password) {
		db.query(userQuery, (error, results) => {
			if (results.length > 0) {
				request.session.loggedin = true
				request.session.username = username
				request.session.id_user = results[0].id_user
				request.session.id_conta = results[0].id_conta
				account = results

				response.render('pages/home', {account: results, layout: "layout"})
			} else {
				response.render('index')
			}
		})
	} else {
		response.render('index')
	}
})

app.post('/material-post', [		
		check('codigo').isNumeric()
	], function(request, response){
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.render('pages/materiais', {material: material, layout: "layout"})
	}
	let id_conta = request.session.id_conta
	let codigo = request.body.codigo
	let nome = request.body.nome
	let custo = request.body.custo.replace(",", ".")
	let lucro = request.body.lucro.replace(",", ".")
	let venda = request.body.venda.replace(",", ".")

	if(!custo){
		custo = 0
	}
	if(!lucro){
		lucro = 0
	}
	if(!venda){
		venda = 0
	}
	
	let query = "insert into material (id_conta, codigo, nome, custo, lucro, venda) values ('"+id_conta+"', '"+codigo+"', '"+nome+"', '"+custo+"', '"+lucro+"', '"+venda+"')"
	db.query(query, (error,results) => {
		if (error) {
			response.send('Erro: ' + error + ' ' + query + ' ' + codigo + ' ' + nome)
		} else {

			query = "select id_conta, codigo, nome, format(venda, 2, 'de_DE') as venda from material where id_conta = '"+id_conta+"'"
			db.query(query, (error, results) => {
				if(error){
					response.send('Erro: ' + error)
				}else{
					material = results
					response.render('pages/materiais', {material: material, layout: "layout"})
				}
			})
		}
	})
})

app.get('/materiais', (request, response) => {
	let id_conta = request.session.id_conta
	query = "select id_conta, codigo, nome, format(venda, 2, 'de_DE') as venda from material where id_conta = '"+id_conta+"'"
	db.query(query, (error, results) => {
		if(error){
			response.send('Erro: ' + error)
		}else{
			material = results
			response.render('pages/materiais', {material: material, layout: "layout"})
		}
	})
})

app.get('/clientes', (request, response) => {
	let id_conta = request.session.id_conta
	query = "select nome, cpf, telefone from cliente where id_conta = '"+id_conta+"'"
	db.query(query, (error, results) => {
		if(error){
			response.send('Erro: ' + error)
		}else{
			cliente = results
			response.render('pages/clientes', {cliente: cliente, layout: "layout"})
		}
	})
})

app.post('/cliente-post', [], function(request, response){
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.render('pages/clientes', {cliente: cliente, layout: "layout"})
	}
	let id_conta = request.session.id_conta
	let nome = request.body.nome
	let endereco = request.body.endereco
	let nascimento = request.body.nascimento
	let sexo = request.body.sexo
	let rg = request.body.rg
	let cpf = request.body.cpf
	let telefone = request.body.telefone
	let email = request.body.email

	let query = "insert into cliente (id_conta, nome, endereco, nascimento, sexo, rg, cpf, telefone, email) values ('"+id_conta+"', '"+nome+"', '"+endereco+"', '"+nascimento+"', '"+sexo+"', '"+rg+"', '"+cpf+"', '"+telefone+"', '"+email+"')"
	db.query(query, (error,results) => {
		if (error) {
			response.send('Erro: ' + error + ' ' + query)
		} else {

			query = "select nome, cpf, telefone from cliente where id_conta = '"+id_conta+"'"
			db.query(query, (error, results) => {
				if(error){
					response.send('Erro: ' + error)
				}else{
					cliente = results
					response.render('pages/clientes', {cliente: cliente, layout: "layout"})
				}
			})
		}
	})
})

app.get('/orcamentos', (request, response) => {
	let id_conta = request.session.id_conta
	query = "select id_cliente, nome from cliente where id_conta = '"+id_conta+"'"
	db.query(query, (error, results) => {
		if(error){
			response.send('Erro: ' + error)
		}else{
			cliente = results
			query = "select o.id_orcamento, c.nome as nome, DATE_FORMAT(o.data, '%d/%m/%Y') as data from orcamento o, cliente c where o.id_cliente = c.id_cliente and o.id_conta = '"+id_conta+"'"
			db.query(query, (error, results) => {
				if(error){
					response.send('Erro: ' + error)
				}else{
					orcamento = results
					response.render('pages/orcamentos', {orcamento: orcamento, cliente: cliente, layout: "layout"})
				}
			})			
		}
	})
})

app.post('/orcamento-post', [
	check('cliente').notEmpty()
], function(request, response){
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.render('pages/orcamentos', {cliente: cliente, layout: "layout"})
	}
	let id_conta = request.session.id_conta
	let id_cliente = request.body.cliente
	let observacao = request.body.observacao

	query = "insert into orcamento (id_conta, id_cliente, data, observacao) values ('"+id_conta+"','"+id_cliente+"', DATE_ADD(NOW(), INTERVAL -3 hour),'"+observacao+"')"
	db.query(query, (error, results) => {
		if(error){
			response.send('Erro: ' + error)
		}else{
			query = "select id_orcamento from orcamento where id_conta = '"+id_conta+"' order by id_orcamento desc limit 1"
			db.query(query, (error, results) => {
				if(error){
					response.send('Erro: ' + error + ' ' + query)
				}else{
					request.session.id_orcamento = results[0].id_orcamento
					query = "select id_material, id_conta, codigo, nome, format(venda, 2, 'de_DE') as venda from material where id_conta = '"+id_conta+"'"
					db.query(query, (error, results) => {
						if(error){
							response.send('Erro: ' + error)
						}else{
							material = results
							response.render('pages/orcamento-item', {itens: itens, material: material, layout: "layout"})
						}
					})
				}
			})
		}
	})	
})

app.post('/orcamento-add',[], function(request, response){
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.render('pages/orcamento-item', {itens: itens, material: material, layout: "layout"})
	}
	let id_orcamento = request.session.id_orcamento
	let qtd = request.body.qtd
	let item = request.body.item
	let unit = request.body.unit.replace(",", ".")
	let total = request.body.total.replace(",", ".")

	let query = "insert into orcamento_item (id_orcamento, qtd, id_material, unitario, total) values ('"+id_orcamento+"','"+qtd+"','"+item+"','"+unit+"','"+total+"')"
	db.query(query, (error, results) => {
		if(error){
			response.send('Erro: ' + error + ' ' + query)
		}else{
			let id_orcamento = request.session.id_orcamento
			query = "select o.qtd, m.nome, format(o.unitario, 2, 'de_DE') as unitario, format(o.total, 2, 'de_DE') as total from orcamento_item o, material m where o.id_material = m.id_material and o.id_orcamento = '"+id_orcamento+"'"
			db.query(query, (error, results) => {
				if(error){
					response.send('Erro: ' + error)
				}else{
					itens = results					
					response.render('pages/orcamento-item', {itens: itens, material: material, layout: "layout"})
				}
			})
		}
	})
})

app.get('/orcamento-print', (request, response) => {
	let id_orcamento = request.session.id_orcamento
	let query = "select DATE_FORMAT(o.data, '%d/%m/%Y') as data, i.qtd, i.unitario, i.total, m.nome as nome_produto, format(i.unitario, 2, 'de_DE') as unitario, format(i.total, 2, 'de_DE') as total, c.nome as nome_cliente, c.endereco, c.telefone, o.observacao from orcamento o inner join orcamento_item i on o.id_orcamento = i.id_orcamento inner join cliente c on o.id_cliente = c.id_cliente inner join material m on i.id_material = m.id_material where o.id_orcamento = '"+id_orcamento+"'"
	db.query(query, (error, results) => {
		if(error){
			response.send('Erro: ' + error)
		}else{		
			response.render('pages/print', {orcamento: results, layout: "print"})
		}
	})	
})

app.get('/orcamento-print/:id_orcamento', (request, response) => {
	var id_orcamento = request.params.id_orcamento	
	let query = "select DATE_FORMAT(o.data, '%d/%m/%Y') as data, i.qtd, i.unitario, i.total, m.nome as nome_produto, format(i.unitario, 2, 'de_DE') as unitario, format(i.total, 2, 'de_DE') as total, c.nome as nome_cliente, c.endereco, c.telefone, o.observacao from orcamento o inner join orcamento_item i on o.id_orcamento = i.id_orcamento inner join cliente c on o.id_cliente = c.id_cliente inner join material m on i.id_material = m.id_material where o.id_orcamento = '"+id_orcamento+"'"		
	db.query(query, (error, results) => {
		if(error){
			response.send('Erro: ' + error)
		}else{		
			response.render('pages/print', {orcamento: results, layout: "print"})
		}
	})
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