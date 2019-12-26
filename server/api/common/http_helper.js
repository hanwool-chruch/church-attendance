var _ = {};
const HttpStatus = require('http-status-codes');


_.createResponseFn = (_fn) => {
    const fn = _fn;

    return async (req, res) => {
      try{
        _.response200(res, await fn(req))
      }
      catch(error){
        _.response500(res, error)
      }
    }
}

_.response200 = (response, data) => {
    response
    .status(HttpStatus.OK)
    .json(data)
}

_.response500 = (response, error) => {
  console.log(error);
    response
    .status(HttpStatus.INTERNAL_SERVER_ERROR)
    .send({
        error: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR)
    })
}

module.exports = _
