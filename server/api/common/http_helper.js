var _ = {};
const HttpStatus = require('http-status-codes');


_.createResponseFn = (_fn) => {
    const fn = _fn;

    return async (req, res) => {
      try{
        HTTP.response200(res, await fn(req))
      }
      catch(error){
        HTTP.response500(error)
      }
    }
}

_.response200 = (response, data) => {
    response
    .status(HttpStatus.OK)
    .json(data)
}

_.response500 = (response, error) => {
    response
    .status(HttpStatus.INTERNAL_SERVER_ERROR)
    .send({
        error: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR)
    })
}

module.exports = _
