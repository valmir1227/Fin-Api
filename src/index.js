const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const customers = [];

//Middleware para verificar existencia do usuário
function verifyExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return response.status(400).json({ error: "Customer not found!" });
  }

  request.customer = customer;

  return next();
}

function getBalance(statement) {
  // Reduce --> Pega todas as informaçoes e transforma em apenas um valor

  const balance = statement.reduce((acc, operation) => {
    if (operation.type === "credit") {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
    //Valor inicial retornado pelo Reduce
  }, 0);
  return balance;
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

app.post("/deposit", verifyExistsAccountCPF, (request, response) => {
  const { description, amount } = request.body;
  const { customer } = request;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit",
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.get("/withdraw", verifyExistsAccountCPF, (request, response) => {
  const { amount } = request.body;
  const { customer } = request;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return response.status(400).json({ error: "Insufficient founds!" });
  } else {
    const statementOperation = {
      amount,
      created_at: new Date(),
      type: "debit",
    };
    customer.statement.push(statementOperation);
    return response.status(201).send();
  }
});

app.listen(3030);
