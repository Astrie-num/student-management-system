require ('dotenv').config();
const express = require('express');
const { pool } = require('./config/db.js');
const apiRoutes = require('./routes/api');
const app = express();
const bodyParser = require('body-parser')
const cors = require('cors');

app.use(cors());
app.use(express());


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended:true
}));

app.use('/api', apiRoutes);


const port = 5000;

app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}`);
    
})
