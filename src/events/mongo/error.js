const chalk = require('chalk');

module.exports = {
    name: 'connecting',
    execute(error) {
        console.log(chalk.red(`An error occured with the database connection: ${error}`));
    },
};