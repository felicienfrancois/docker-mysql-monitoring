const http = require('http');
const mysql      = require('mysql');
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || '3306',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || null
});
const endpoints = {};
if (process.env.ENDPOINT) {
	endpoints["/"+process.env.ENDPOINT.replace(/^\//, "")] = {
		query: process.env.QUERY || "SELECT 1 AS UP",
		singleLine: process.env.SINGLE_LINE || false,
		fields: process.env.FIELDS && process.env.FIELDS.split(",")
	}
}
let i=0;
while (i<2 || process.env["ENDPOINT_" + i] || process.env["ENDPOINT" + i]) {
	if (process.env["ENDPOINT_" + i] || process.env["ENDPOINT" + i]) {
		endpoints["/"+(process.env["ENDPOINT_" + i] || process.env["ENDPOINT" + i]).replace(/^\//, "")] = {
			query: process.env["QUERY_" + i] || process.env["QUERY" + i],
			singleLine: process.env["SINGLE_LINE_" + i] || process.env["SINGLE_LINE" + i] || false,
			fields: (process.env["FIELDS_" + i] || process.env["FIELDS" + i]) && (process.env["FIELDS_" + i] || process.env["FIELDS" + i]).split(",")
		};
	}
	i++;
}
if (Object.keys(endpoints).length === 0) {
	endpoints["/"] = {
		query: "SELECT 1 AS UP",
		singleLine: true,
		fields: null
	}
}

http.createServer(function(req, resp) {
	let startTime = new Date().getTime();
	console.log("[Request] "+req.method + " " + req.url);
	const endpoint = endpoints[req.url];
	if (endpoint) {
		connection.connect();
		connection.query(endpoint.query, function (error, results, fields) {
			if (error) {
				console.error("[500] "+req.method + " " + req.url, error);
				resp.statusCode = 500;
				resp.setHeader('Content-Type', 'application/json; charset=utf-8');
				resp.end(JSON.stringify(error));
			} else {
				console.error("[200] "+req.method + " " + req.url + " (" + (new Date().getTime() - startTime) + "ms)");
				resp.statusCode = 200;
				resp.setHeader('Content-Type', 'application/json; charset=utf-8');
				let printedResult = endpoint.singleLine ? results[0] : results;
				if (endpoint.fields) {
					printedResult = printedResult.map(function(e) {
						var r = {};
						for (let f of endpoint.fields) {
							r[f] = e[f];
						}
						return r;
					});
				}
				resp.end(JSON.stringify(printedResult));
			}
		});
		connection.end();
	} else {
		console.error("[404] "+req.method + " " + req.url);
		resp.statusCode = 404;
		resp.setHeader('Content-Type', 'application/json; charset=utf-8');
		resp.end('{ "error": { "message": "Not found" } }');
	}
}).listen(80);

