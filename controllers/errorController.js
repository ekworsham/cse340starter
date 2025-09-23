const errorController = {};

errorController.triggerError = (req, res, next) => {
  throw new Error("Intentional 500 error for testing purposes.");
};

module.exports = errorController;