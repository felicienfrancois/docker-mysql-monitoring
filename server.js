const http = require('http');
const mysql = require('mysql2');
const connectionSettings = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || '3306',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || null
};
const endpoints = {};
if (process.env.ENDPOINT) {
	endpoints["/"+process.env.ENDPOINT.replace(/^\//, "")] = {
		query: process.env.QUERY || "SELECT 1 AS UP",
		singleLine: process.env.SINGLE_LINE || false,
		fields: process.env.FIELDS && process.env.FIELDS.split(","),
		expect: process.env.EXPECT || null,
		connectionSettings: connectionSettings
	}
}
let i=0;
while (i<2 || process.env["ENDPOINT_" + i] || process.env["ENDPOINT" + i]) {
	if (process.env["ENDPOINT_" + i] || process.env["ENDPOINT" + i]) {
		endpoints["/"+(process.env["ENDPOINT_" + i] || process.env["ENDPOINT" + i]).replace(/^\//, "")] = {
			query: process.env["QUERY_" + i] || process.env["QUERY" + i] || process.env.QUERY,
			singleLine: process.env["SINGLE_LINE_" + i] || process.env["SINGLE_LINE" + i] || process.env.SINGLE_LINE || false,
			fields: (process.env["FIELDS_" + i] || process.env["FIELDS" + i] || process.env.FIELDS) && (process.env["FIELDS_" + i] || process.env["FIELDS" + i] || process.env.FIELDS).split(","),
			expect: process.env["EXPECT_" + i] || process.env["EXPECT" + i] || process.env.EXPECT || null,
			connectionSettings: (process.env["MYSQL_HOST_" + i] || process.env["MYSQL_HOST" + i] || process.env["DATABASE_NAME_" + i] || process.env["DATABASE_NAME" + i]) ? {
				  host: process.env["MYSQL_HOST_" + i] || process.env["MYSQL_HOST" + i] || process.env.MYSQL_HOST || 'localhost',
				  port: process.env["MYSQL_PORT_" + i] || process.env["MYSQL_PORT" + i] || process.env.MYSQL_PORT || '3306',
				  user: process.env["MYSQL_USER_" + i] || process.env["MYSQL_USER" + i] || process.env.MYSQL_USER || 'root',
				  password: process.env["MYSQL_PASSWORD_" + i] || process.env["MYSQL_PASSWORD" + i] || process.env.MYSQL_PASSWORD || 'password',
				  database: process.env["MYSQL_DATABASE_" + i] || process.env["MYSQL_DATABASE" + i] || process.env.DATABASE_NAME || null
			} : connectionSettings
		};
	}
	i++;
}
if (Object.keys(endpoints).length === 0) {
	endpoints["/"] = {
		query: "SELECT 1 AS UP",
		singleLine: true,
		fields: null,
		expect: null,
		connectionSettings: connectionSettings
	}
}

http.createServer(function(req, resp) {
	let startTime = new Date().getTime();
	console.log("[Request] "+req.method + " " + req.url);
	const endpoint = endpoints[req.url];
	if (endpoint) {
		endpoint.connection = endpoint.connection || mysql.createPool(endpoint.connectionSettings);
		endpoint.connection.query(endpoint.query, function (error, results, fields) {
			if (error) {
				console.error("[500] "+req.method + " " + req.url, error);
				resp.statusCode = 500;
				resp.setHeader('Content-Type', 'application/json; charset=utf-8');
				resp.end(JSON.stringify(error));
			} else {
				resp.setHeader('Content-Type', 'application/json; charset=utf-8');
				let passTest = !endpoint.expect;
				if (endpoint.expect) {
					passTest = (function(result) {
						try {
							return eval(endpoint.expect);
						} catch(e) {
							console.error("Error while evaluating expect condition", e);
							return false;
						}
					})(endpoint.singleLine ? results && results[0] : results);
				}
				resp.statusCode = passTest ? 200 : 417;
				if (passTest) {
					console.log("[200] "+req.method + " " + req.url + " (" + (new Date().getTime() - startTime) + "ms)");
				} else {
					console.error("[417] "+req.method + " " + req.url + " (" + (new Date().getTime() - startTime) + "ms)");
				}
				let printedResult = results;
				if (endpoint.fields && printedResult && printedResult.length) {
					printedResult = printedResult.map(function(e) {
						var r = {};
						for (let f of endpoint.fields) {
							r[f] = e[f];
						}
						return r;
					});
				}
				printedResult = endpoint.singleLine ? printedResult && printedResult[0] : printedResult;
				resp.end(JSON.stringify(printedResult));
			}
		});
	} else {
		console.error("[404] "+req.method + " " + req.url);
		resp.statusCode = 404;
		resp.setHeader('Content-Type', 'application/json; charset=utf-8');
		resp.end('{ "error": { "message": "Not found" } }');
	}
}).listen(80);
console.log("Server started on port 80");

