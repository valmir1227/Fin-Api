const { response } = require("express");
const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const customers = [];

//Middleware
function verifyExistsAccountCPF(request, response, next) {
  const { cpf } = request.header;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return response.status(400).json({ error: "Customer not found!" });
  }

  request.customer = customer;

  return next();
}

app.post("/account", (request, response) => {
  const { cpf, name } = request.body;

  const customerAlreadyExists = customers.some(
    (custumer) => custumer.cpf === cpf
  );

  if (customerAlreadyExists) {
    //400 = Bad Request
    return response.status(400).json({ error: "Costumer already exists!" });
  }

  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: [],
  });
  //201 = Created
  return response.status(201).send();
});

//app.use(verifyExistsAccountCPF)

app.get("/statement", verifyExistsAccountCPF, (request, response) => {
  const { customer } = request;

  return response.json(customer.statement);
});

app.listen(3000);
