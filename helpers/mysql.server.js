import Sequelize from 'sequelize'

let sequelize = null

function initInstance() {
  if (!sequelize) {
    console.info('Initializing Sequelize connection.')
    try {
      sequelize = new Sequelize({
        dialect: 'mysql',
        host: process.env.DATABASE_HOST,
        database: process.env.DATABASE_SCHEMA,
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        logging: process.env.DEBUG ? console.debug : false
      })
      console.log('Sequelize instance ->', sequelize)
    } catch (err) {
      console.error(err)
    }
  }
}

function getInstance() {
  if (!sequelize) {
    initInstance()
  }
  return sequelize
}

export { initInstance, getInstance }
