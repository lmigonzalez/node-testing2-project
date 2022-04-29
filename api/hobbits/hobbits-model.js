const db = require('../../data/dbConfig')

module.exports = {
  insert,
  update,
  remove,
  getAll,
  getById,
}

function getAll() {
  return db('hobbits')
}

function getById(id) {
  return db('hobbits')
    .where('id', id)
    .first();
}

async function insert(hobbit) {
  return db('hobbits')
    .insert(hobbit)
    .then(([id]) => getById(id));
}

async function update(id, changes) {
  return db('hobbits')
    .update(changes)
    .where('id', id)
    .then(() => getById(id));
}

async function remove(id) {
  const result = await getById(id);
  await db('hobbits').del().where('id', id);
  return result;
}