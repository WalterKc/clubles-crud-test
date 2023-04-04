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

/**
 * estos son asignaciones normales, menos el path, ahora vamos a explicar que hace
 * el path solo controla los nombre de la direcciones cosas como "/elpichi/superpichi", eso controla
 */

/**
 * ACA se va a practicar lo de express, por mi cuenta, el primero objetivo es simple, un hola mundo
 * con todo activado, luego, vamos a ver mas
 */

//traer equipos funciona bien, no necesita cambios
function traerEquipos() {
  const equipos = JSON.parse(fs.readFileSync("./data/equipos.db.json"));
  return equipos;
}
function listadoTest(lista) {
  for (let x = 0; x < traerEquipos().length; x++) {
    lista.push(traerEquipos()[x].name);
  }
}
app.post("/equipos", upload.none("TestPOST"), (request, response) => {
  //const incomingAccount = request.body;
  //console.log(" ESTE ES EL request.body ", request.body);
  //console.log(" ESTE ES EL incomingAccount ", incomingAccount);
  console.log(" POST ", request.method);

  //accounts.push(incomingAccount);
  let listaNombres = [];
  listadoTest(listaNombres);
  response.render("home_ejemplo", {
    layout: "ejemplo",
    data: {
      Mensaje,
      // notar que esta función se ejecuta al renderear la vista,
      // en el servidor, no en el navegador.
      nombreMayusculas: () => Mensaje.toUpperCase(),

      listaNombres,
      esPar: Math.ceil(Math.random() * 1000) % 2 === 0,
    },
  });

  //response.json(accounts);
});
app.put("/equipos", upload.none("TestPUT"), (request, response) => {
  //const incomingAccount = request.body;
  //console.log(" ESTE ES EL request.body ", request.body);
  //console.log(" ESTE ES EL incomingAccount ", incomingAccount);
  console.log(" PUT ", request.method);

  //accounts.push(incomingAccount);
  let listaNombres = [];
  listadoTest(listaNombres);
  response.render("home_ejemplo", {
    layout: "ejemplo",
    data: {
      Mensaje,
      // notar que esta función se ejecuta al renderear la vista,
      // en el servidor, no en el navegador.
      nombreMayusculas: () => Mensaje.toUpperCase(),

      listaNombres,
      esPar: Math.ceil(Math.random() * 1000) % 2 === 0,
    },
  });

  //response.json(accounts);
});
//acordate de poner el app.listen, sino no vas a mostrar nada en pantalla
app.get("/equipos", (req, res) => {
  //const equipos = fs.readFileSync("./data/equipos.json");
  //res.setHeader("Content-Type", "application/json");
  console.log(" TEST ", traerEquipos().length);
  console.log(" TEST ", traerEquipos()[0].name);
  let listaNombres = [];
  listadoTest(listaNombres);
  console.log(req.method);

  res.render("home_ejemplo", {
    layout: "ejemplo",
    data: {
      Mensaje,
      // notar que esta función se ejecuta al renderear la vista,
      // en el servidor, no en el navegador.
      nombreMayusculas: () => Mensaje.toUpperCase(),
      /*
      listado: [
        traerEquipos()[0].name,
        traerEquipos()[1].name,
        traerEquipos()[2].name,
        traerEquipos()[3].name,
      ]
      */
      listaNombres,
      esPar: Math.ceil(Math.random() * 1000) % 2 === 0,
    },
  });
  //res.send(equipos);
});
//OK, vamos a tocar un poco esto asi lo terminamos, no esta mal en realidad, pero le falta un poco mas
/** primero, vamos a desactivar el equipoSelecionado, no se usa
 * llamamos  los jugadores del team en cuestion, no es necesario el data en mi programa, es lo mismo
 * que el id equipo, pero el mio es mas corto
 *
 */

app.get("/equipos/:tla", (req, res) => {
  let idEquipo = traerEquipos().find(
    (elemento) => elemento.tla === req.params.tla
  );
  let datosEquipo = JSON.parse(
    fs.readFileSync(`./data/equipos/${req.params.tla}.json`)
  );
  let jugadoresEquipo = datosEquipo.squad;

  res.render("equipo-seleccionado-TEST", {
    layout: "ejemplo",
    data: {
      idEquipo,
      w,
    },
  });
});
app.get("/equiposTEST", (req, res) => {
  let listaNombres = [];
  listadoTest(listaNombres);
  let equipos = traerEquipos();

  res.render("home_equipos_TEST", {
    layout: "ejemplo",
    data: {
      equipos,
      listaNombres,
    },
  });
});
app.get("/editar/:tla", (req, res) => {
  let idEquipo = traerEquipos().find(
    (elemento) => elemento.tla === req.params.tla
  );
  res.render("editar_TEST", {
    layout: "ejemplo",
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
  res.render("CrearTeam_TEST", {
    layout: "ejemplo",
  });
});

app.post("/CrearTeam", upload.single("imagen"), (req, res) => {
  const equipos = JSON.parse(fs.readFileSync("./data/equipos.db.json"));
  const comrpobarTla = guardarTlaEquipos(equipos);
  if (
    comrpobarTla.find((elemento) => elemento === req.body.tla) !== undefined
  ) {
    res.render("CrearTeam_TEST", {
      layout: "ejemplo",
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
    res.redirect("/equiposTEST");
  } else {
    equipos.push(crearNuevoEquipo(req.body, req.file !== undefined));
    fs.writeFileSync("./data/equipos.db.json", JSON.stringify(equipos));
    fs.writeFileSync(
      `./data/equipos/${req.body.tla}.json`,
      JSON.stringify(crearNuevoEquipo(req.body, req.file !== undefined))
    );
    res.redirect("/equiposTEST");
  }
});
app.get("/eliminar/:tla", (req, res) => {
  const equipos = traerEquipos();
  const equiposRestantes = equipos.filter(
    (equipo) => equipo.tla !== `${req.params.tla}`
  );
  fs.writeFileSync("./data/equipos.db.json", JSON.stringify(equiposRestantes));
  fs.unlinkSync(`./data/equipos/${req.params.tla}.json`);
  res.redirect("/equiposTEST");
});

app.get("/reiniciar", (req, res) => {
  const equiposTotales = JSON.parse(fs.readFileSync("./data/equipos.json"));
  fs.writeFileSync("./data/equipos.db.json", JSON.stringify(equiposTotales));
  res.redirect("/");
});

app.listen(PUERTO);
console.log(`Escuchando en http://localhost:${PUERTO}`);
