import * as express from "express";

export const notFoundHandler: express.RequestHandler = (req, res) => {
  res.status(404).send({
    message: `${req.method} ${req.url} is not defined yet`
  });
};
