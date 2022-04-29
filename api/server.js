const express = require("express");

const Hobbits = require("./hobbits/hobbits-model.js");

const server = express();

server.use(express.json());

server.get("/", (req, res) => {
  res.status(200).json({ api: "up" });
});

server.get("/hobbits", (req, res) => {
  Hobbits.getAll()
    .then(hobbits => {
      res.status(200).json(hobbits);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.get("/hobbits/:id", (req, res) => {
  Hobbits.getById(req.params.id)
    .then(hobbit => {
      if(hobbit == null) {
        res.status(404).json({ message: 'Hobbit not found' });
        return;
      }
      res.status(200).json(hobbit);
    });
});

server.post("/hobbits", (req, res) => {
  Hobbits.insert(req.body)
    .then(hobbit => {
      res.status(201).json(hobbit);
    })
    .catch(error => {
      res.status(500).json(error);
    })
});

server.delete("/hobbits/:id", (req, res) => {
  Hobbits.remove(req.params.id)
    .then(hobbit => {
      if(hobbit == null) {
        res.status(404).json({ message: 'Hobbit not found' });
        return;
      }
      res.status(200).json(hobbit);
    });
});

server.put("/hobbits/:id", (req, res) => {
  Hobbits.update(req.params.id, req.body)
    .then(hobbit => {
      if(hobbit == null) {
        res.status(404).json({ message: 'Hobbit not found' });
        return;
      }
      res.status(200).json(hobbit);
    })
    .catch(error => {
      res.status(500).json(error);
    })
});

module.exports = server;