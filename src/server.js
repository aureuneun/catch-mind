import express from "express";
import path from "path";
import helmet from "helmet";
import morgan from "morgan";
import socketIO from "socket.io";
import socketController from "./socket";
import events from "./events";

const PORT = 4000;

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "static")));

app.get("/", (req, res) => {
  res.render("home", { events });
});

const server = app.listen(PORT, () => {
  console.log(`Linstening on: http://localhost:${PORT}`);
});

const io = socketIO.listen(server);

io.on(events.connection, (socket) => socketController(socket, io));
