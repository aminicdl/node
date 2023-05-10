const Pool = require('pg').Pool
const crypto = require('crypto').randomBytes(256).toString('hex');

const pool = new Pool({
    user: 'amin',
    host: 'dpg-ch74bmbhp8u9bo5253h0-a',
    database: 'webhook_1qtv',
    password: 'tizfPXhsbgmwDW8ySfUYWjThhTbKnQFX',
    port: 5432,
    ssl: false,
})
// const pool = new Pool({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'ali',
//   password: 'amin666',
//   port: 5432,
// })
const getUsers = (request, response) => {
  pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const getUserById = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const createUser = (request, response) => {
  const { type, position, symbol, tp_price, sl, entry_price, tp_percent, rr, strategy } = request.body
  if (request.body.type == "open_short") {
    pool.query('INSERT INTO signals (type, position, symbol, tp_price, sl, entry_price, tp_percent, rr, strategy) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ', [type, position, symbol, tp_price, sl, entry_price, tp_percent, rr, strategy], (error, results) => {
      if (error) {
        throw error
      }
      // response.status(201).send(`User added with ID: ${id}`)
      response.status(201).send(`signal add `)
    })
  }
  if (request.body.type == "open_long") {
    pool.query('INSERT INTO signals (type, position, symbol, tp_price, sl, entry_price, tp_percent, rr, strategy) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ', [type, position, symbol, tp_price, sl, entry_price, tp_percent, rr, strategy], (error, results) => {
      if (error) {
        throw error
      }
      // response.status(201).send(`User added with ID: ${id}`)
      response.status(201).send(`signal add `)
    })
  }
  if (request.body.type != "open_long") {
    response.status(201).send(`no `)
  }
  if (request.body.type != "open_short") {
    response.status(201).send(`no `)
  }
    
  // if (request.body.type == "close_long") {
  //   pool.query('INSERT INTO signals (type, position, symbol, tp_price, sl, entry_price, tp_percent, rr, strategy) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ', [type, position, symbol, tp_price, sl, entry_price, tp_percent, rr, strategy], (error, results) => {
  //     if (error) {
  //       throw error
  //     }
  //     // response.status(201).send(`User added with ID: ${id}`)
  //     response.status(201).send(`signal add `)
  //   })
  // }
  // if (request.body.type == "close_short") {
  //   pool.query('INSERT INTO signals (type, position, symbol, tp_price, sl, entry_price, tp_percent, rr, strategy) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ', [type, position, symbol, tp_price, sl, entry_price, tp_percent, rr, strategy], (error, results) => {
  //     if (error) {
  //       throw error
  //     }
  //     // response.status(201).send(`User added with ID: ${id}`)
  //     response.status(201).send(`signal add `)
  //   })
  // }

}

const updateUser = (request, response) => {
  const id = parseInt(request.params.id)
  const { name, email } = request.body

  pool.query(
    'UPDATE users SET name = $1, email = $2 WHERE id = $3',
    [name, email, id],
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`User modified with ID: ${id}`)
    }
  )
}

const deleteUser = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`User deleted with ID: ${id}`)
  })
}

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
  }