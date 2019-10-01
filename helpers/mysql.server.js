import Sequelize from 'sequelize'

let sequelize = null

function initInstance() {
  if (!sequelize) {
    console.info('Initializing Sequelize connection.')
    console.log('Sequelize instance ->', Sequelize)
    sequelize = new Sequelize({
      dialect: 'mysql',
      host: process.env.DATABASE_HOST,
      database: process.env.DATABASE_SCHEMA,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      logging: process.env.DEBUG ? console.debug : false
    })
  }
}

function getInstance() {
  if (!sequelize) {
    initInstance()
  }
  return sequelize
}

export { initInstance, getInstance }
