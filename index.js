import dotenv from 'dotenv'
dotenv.config()
import chalk from 'chalk';

import express from 'express';
import bootstrap from './src/app.controller.js';

const app = express()
const port = process.env.PORT || 5000

bootstrap(app,express);


app.listen(port, () => console.log(chalk.yellow(`Example app listening on port ${port}!`)))

// import 'dotenv/config'
// import dotenv from 'dotenv'