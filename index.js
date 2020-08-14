//Projekt initialisieren: npm init
//Start des Servers: node index.js
//Mariadb Info: N:\Raspberry\Nginx_PHP_MariaDB.txt  mariadb --user=oed --password=oed01 bbq
//Curl: curl 192.168.1.7:8000
var express     = require('express');
var mysql       = require('mysql');
var app         = express();
var bodyParser  = require('body-parser');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'oed',
    password : 'oed01',
    database : 'bbq',
    debug    :  false,
    connectionLimit : 100
});

app.set('port', (process.env.PORT || 8000))

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


// Visualize
//curl 192.168.1.7:8000
app.get('/', function(req, res) {
       
    console.log("GET!");

    // open the MySQL connection
    /*connection.connect(error => {
      if (error) res.json({"code" : 503, "error": "database connection error"});
      console.log("Successfully connected to the database.");
    });
    */
    connection.query("SELECT * FROM bbq1", (err, qres) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      
      //close connection
      /*connection.end(function(err) {
        if (err) {
          return console.log('error:' + err.message);
        }
        console.log('Close the database connection.');
      });
      */
      //return result
      console.log("values: ", qres);
      res.json({"code": 200, "values" : qres});
      //res.json({"code": 200});
    }); 
})

// Send data
//Test Curl aufruf
//curl --data "sender_id=1&temperature=33.33&humidity=123" 192.168.1.7:8000/esp8266_trigger
app.post('/esp8266_trigger', function(req, res){
    console.log("POST!");
    var sender_id, temperature, humidity;
    
    if (!req.body.hasOwnProperty("sender_id") || req.body.sender_id == "") {
        res.json({"code" : 403, "error": "Sender ID missing"});
        return;
    } else {
        sender_id = req.body.sender_id;
    }
    
    if (!req.body.hasOwnProperty("temperature") || parseFloat(req.body.temperature) == NaN) {
        res.end.json({"code" : 403, "error": "Temperature Value missing"});
        return;
    } else {
        temperature = parseFloat(req.body.temperature);
    }
     
    // save
    var query = connection.query
    (
      'INSERT INTO bbq1 VALUES   (NOW(), ' + mysql.escape(sender_id) + ', 1, ' + temperature + ');', 
      function (error, results, fields) 
      {
        if (error) {
            res.json({"code" : 403, "status" : "Error in connection database"});
            return;
        }
        res.json({"code": 200});
      }
    );
   
});

//app.listen(app.get('port'));
app.listen(app.get('port'), () => {
 console.log("Server running on port " + app.get('port'));
});
