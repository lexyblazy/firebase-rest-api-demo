import * as firebaseAdmin from "firebase-admin";
import * as functions from "firebase-functions";
import express from "express";
import nanoid from "nanoid";
import * as utils from "./utils";
import config from "./config";
import * as serviceAccount from "./serviceAccount.json";

const app = express();

const firebase = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert({
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key
  }),

  databaseURL: config.DATABASE_URL
});

const db = firebase.firestore();

// GET /users  -  returns all the users in the database
app.get("/users", async (req: express.Request, res: express.Response) => {
  try {
    const usersCollectionReference = db.collection("users");
    const usersSnapshot = await usersCollectionReference.get();
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.status(200).send({ users });
  } catch (error) {
    res.send(error);
  }
});

// POST /users -   adds a new user to the database
app.post("/users", async (req: express.Request, res: express.Response) => {
  try {
    const { firstName, lastName, email } = req.body;
    await db
      .collection("users")
      .doc(nanoid())
      .set({
        firstName,
        lastName,
        email
      });
    res.status(201).send({ message: "Created a new User", success: true });
  } catch (error) {
    res.send(error);
  }
});

// GET /users/:id  - returns a specific user by id
app.get("/users/:id", async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const userDocumentReference = db.collection("users").doc(id);
    const userDocumentSnapshot = await userDocumentReference.get();
    const userDocument = {
      id: userDocumentSnapshot.id,
      ...userDocumentSnapshot.data()
    };
    res.send({ user: userDocument });
  } catch (error) {
    res.send(error);
  }
});

// PATCH /users/:id - updates a specific user
app.patch("/users/:id", async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const userDocumentReference = db.collection("users").doc(id);
    await userDocumentReference.update({ ...req.body });

    res.send({ message: "User updated", success: true });
  } catch (error) {
    res.send(error);
  }
});

// DELETE /users/:id - deletes a specific user
app.delete(
  "/users/:id",
  async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const userDocumentReference = db.collection("users").doc(id);
      await userDocumentReference.delete();
      res.send({ message: "User Deleted", success: true });
    } catch (error) {
      res.send(error);
    }
  }
);

// to handle routes not defined in our app
app
  .route("*")
  .get(utils.notFoundHandler)
  .post(utils.notFoundHandler)
  .put(utils.notFoundHandler)
  .patch(utils.notFoundHandler)
  .delete(utils.notFoundHandler);

export const v1 = functions.https.onRequest(app);
