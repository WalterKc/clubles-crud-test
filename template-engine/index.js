const fs = require("fs");
const express = require("express");
const multer = require("multer");
const exphbs = require("express-handlebars");
const almacenamiento = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "./uploads/imagenes");
  },
  filename(req, file, cb) {
    cb(null, `${file.originalname}`);
  },
});

const upload = multer({ storage: almacenamiento });

const PUERTO = 8081;
const app = express();
const hbs = exphbs.create();
const path = require("path");

app.use(express.static(path.join(__dirname, "../public")));

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/uploads`));

function traerEquipos() {
  const equipos = JSON.parse(fs.readFileSync("./data/equipos.db.json"));
  return equipos;
}
function listadoTest(lista) {
  for (let x = 0; x < traerEquipos().length; x++) {
    lista.push(traerEquipos()[x].name);
  }
}

app.get("/", (req, res) => {
  let listaNombres = [];
  listadoTest(listaNombres);
  let equipos = traerEquipos();

  res.render("Home", {
    layout: "HtmlBase",
    data: {
      equipos,
      listaNombres,
    },
  });
});
app.get("/equipos/:tla", (req, res) => {
  let idEquipo = traerEquipos().find(
    (elemento) => elemento.tla === req.params.tla
  );
  let datosEquipo = JSON.parse(
    fs.readFileSync(`./data/equipos/${req.params.tla}.json`)
  );
  let jugadoresEquipo = datosEquipo.squad;

  res.render("Equipo_selecionado", {
    layout: "HtmlBase",
    data: {
      idEquipo,
      jugadoresEquipo,
    },
  });
});

app.get("/editar/:tla", (req, res) => {
  let idEquipo = traerEquipos().find(
    (elemento) => elemento.tla === req.params.tla
  );
  res.render("Editar_equipo", {
    layout: "HtmlBase",
    data: {
      idEquipo,
    },
  });
});
function crearNuevoEquipo(equipo, file) {
  const nuevoEquipo = {
    name: equipo.nombre,
    shortName: equipo.nombreAbreviado,
    tla: equipo.tla,
    email: equipo.email,
    area: {
      name: equipo.paisNombre,
    },
    phone: equipo.telefono,
    website: equipo.paginaWeb,
    founded: equipo.fundacion,
    address: equipo.direccion,
    clubColors: equipo.colores,
    venue: equipo.estadio,
    crestUrl: equipo.imagenURL,
    crestLocal: file === "escudo" ? equipo.crestLocal : `/imagenes/${file}`,
  };
  return nuevoEquipo;
}
function guardarTlaEquipos(equipos) {
  const equiposTla = [];
  equipos.forEach((equipo) => {
    equiposTla.push(equipo.tla);
  });
  return equiposTla;
}
app.get("/CrearTeam", (req, res) => {
  res.render("Crear_equipo", {
    layout: "HtmlBase",
  });
});

app.post("/CrearTeam", upload.single("imagen"), (req, res) => {
  const equipos = JSON.parse(fs.readFileSync("./data/equipos.db.json"));
  const comrpobarTla = guardarTlaEquipos(equipos);
  if (
    comrpobarTla.find((elemento) => elemento === req.body.tla) !== undefined
  ) {
    res.render("Crear_equipo", {
      layout: "HtmlBase",
      data: {
        error: `El tla ${req.body.tla} ya fue usado.`,
      },
    });
  } else if (req.file !== undefined) {
    console.log(" DIRECCION O ALGO ", req.body.tla);
    equipos.push(crearNuevoEquipo(req.body, req.file.originalname));
    fs.writeFileSync("./data/equipos.db.json", JSON.stringify(equipos));
    fs.writeFileSync(
      `./data/equipos/${req.body.tla}.json`,
      JSON.stringify(crearNuevoEquipo(req.body, req.file.originalname))
    );
    res.redirect("/");
  } else {
    equipos.push(crearNuevoEquipo(req.body, req.file !== undefined));
    fs.writeFileSync("./data/equipos.db.json", JSON.stringify(equipos));
    fs.writeFileSync(
      `./data/equipos/${req.body.tla}.json`,
      JSON.stringify(crearNuevoEquipo(req.body, req.file !== undefined))
    );
    res.redirect("/");
  }
});
app.get("/eliminar/:tla", (req, res) => {
  const equipos = traerEquipos();
  const equiposRestantes = equipos.filter(
    (equipo) => equipo.tla !== `${req.params.tla}`
  );
  fs.writeFileSync("./data/equipos.db.json", JSON.stringify(equiposRestantes));
  fs.unlinkSync(`./data/equipos/${req.params.tla}.json`);
  res.redirect("/");
});

app.get("/reiniciar", (req, res) => {
  const equiposTotales = JSON.parse(fs.readFileSync("./data/equipos.json"));
  fs.writeFileSync("./data/equipos.db.json", JSON.stringify(equiposTotales));
  res.redirect("/");
});

app.listen(PUERTO);
console.log(`Escuchando en http://localhost:${PUERTO}`);
