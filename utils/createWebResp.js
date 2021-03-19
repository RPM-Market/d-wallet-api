const webResponse = require('./webResponse');

const createWebResp = (res, code, data) => {
  const response = new webResponse();
  response.code = code;
  response.data = data;
  res.status(response.getCode).send(response.create());
};

const errorWebResp = (res, code, errorMessage, errorData) => {
  const response = new webResponse();
  response.code = code;
  response.message = errorMessage;
  response.errorData = errorData;
  res.status(response.getCode).send(response.create());
};

module.exports.createWebResp = createWebResp;
module.exports.errorWebResp = errorWebResp;
