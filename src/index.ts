import express, { Request, Response } from "express";
import { AddressInfo } from "net";
import { HashManager } from "./services/HashManager";
import { IdGenerator } from "./services/IdGenerator";
import { UserDB } from "./data/UserDatabase";
import { Authenticator } from "./services/Authenticator";

const app = express();

app.use(express.json());

const server = app.listen(process.env.PORT || 3003, () => {
  if (server) {
    const address = server.address() as AddressInfo;
    console.log(`Server is running in http://localhost:${address.port}`);
  } else {
    console.error(`Failure upon starting server.`);
  }
});

const userDb = new UserDB();
const hashManager = new HashManager();
const auth = new Authenticator();
const idManager = new IdGenerator();

app.post("/signup", async (req: Request, res: Response) => {
  try {
    const userData = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    };

    if (!userData.name) {
      throw new Error("Invalid Name");
    }

    if (!userData.email && userData.email.indexOf("@") === -1) {
      throw new Error("Invalid Email");
    }

    if (!userData.password && userData.password.length < 6) {
      throw new Error("Invalid Password");
    }

    const encryptedPassword = await hashManager.hash(userData.password);
    const id = idManager.generate();

    userDb.createUser(id, userData.name, userData.email, encryptedPassword);

    const token = auth.generateToken({ id });

    res.status(200).send({
      token: token,
    });
  } catch (err) {
    res.status(200).send({
      message: err.message,
    });
  }
});

app.post("/login", async (req: Request, res: Response) => {
  try {
    const userData = {
      email: req.body.email,
      password: req.body.password,
    };

    if (!userData.email && userData.email.indexOf("@") === -1) {
      throw new Error("Invalid Email");
    }

    const user = await userDb.getUserByEmail(userData.email);

    const decryptedPassword = hashManager.compare(
      userData.password,
      user.password
    );

    if (!decryptedPassword) {
      throw new Error("Invalid Password");
    }

    const token = auth.generateToken({ id: user.id });

    res.status(200).send({
      token,
    });
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
});

app.get("/user/profile", async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization as string;

    const authData = auth.getData(token);
    const userInfo = await userDb.getUserById(authData.id)

    res.status(200).send({
      id: userInfo.id,
      name: userInfo.name,
      email: userInfo.email
    });
  } catch (err) {
    res.status(400).send({
      message: err.message,
    });
  }
});
