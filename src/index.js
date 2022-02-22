const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const costumers = [];

/*
 * CPF - string
 * Name -string
 * Id - uuid
 * Statement - []
 */

app.post("/account", (require, response) => {
  const { cpf, name } = require.body;

  const id = uuidv4();

  costumers.push({
    cpf,
    name,
    id,
    statement: [],
  });
  return response.status(201).send();
});

app.listen(3000);
