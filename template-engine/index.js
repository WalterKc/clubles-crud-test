//ok, esto no es mio, pero vamos a desarmalo para entenrderlo bien, no creo que se considere trampa
const fs = require("fs");
const express = require("express");
const multer = require("multer");
const exphbs = require("express-handlebars");
/**
 * estos de arriba, son cosas (no se como se llamam) que necesitamos para que esto funcione
 * el fs, es para acceder a archivos en la computadora, express, es para usar sus estructura y funciones
 * multer es para manejar imagenes/archivos(es diferen a acceder)
 * y exphbs es handlebars, para poder usar su extrucura
 */

const almacenamiento = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "./uploads/imagenes");
  },
  filename(req, file, cb) {
    cb(null, `${file.originalname}`);
  },
});

/**
 *  el multer.diskStorage controla como se llama los archivos y donde se guardan
 *  y el upload de abajo le dique que lo guarde, son cosas diferentes, uno configura en donde
 *  y con que nombre se va a guardar, y el otro, usando eso, lo guarda
 */
const upload = multer({ storage: almacenamiento });

const PUERTO = 8081;
const app = express();
const hbs = exphbs.create();
const path = require("path");
//bueno, esta shit viene con express, es para usar archivos "estaticos", osea, cosas fijas(mas o menos)
//cosas como imagenes, css y alguna funcion fija, basicamente, por eso no funcionaba esto,
//pero igualmente, no entiendo que es el dirname...
/**
 * The __dirname in a node script returns the path of the folder where the current
 * JavaScript file resides.
 * __filename and __dirname are used to get the filename and directory name of the currently
 * executing file.
 * basicamente, devuelve el directorio actual
 */
//bueno, el path join se explica bastante bien en la docu, solo junta lo que se le tira adentro
//y cada coma representa una "/"
app.use(express.static(path.join(__dirname, "../public")));

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
//esta cosa de aca abajo es importante, MUY IMPORTANTE, hay ver ver que es
app.use(express.json());
//no me queda claro lo que hace este urlencoded la verdad, pero tiene algo que ver con el nestedo de cosas
app.use(express.urlencoded({ extended: true }));
// este es mas facil, basicamente, deja cargar lo que esta adentro de "uploads", en este caso las imagenes
app.use(express.static(`${__dirname}/uploads`));

/**
 * estos son asignaciones normales, menos el path, ahora vamos a explicar que hace
 * el path solo controla los nombre de la direcciones cosas como "/elpichi/superpichi", eso controla
 */

/**
 * ACA se va a practicar lo de express, por mi cuenta, el primero objetivo es simple, un hola mundo
 * con todo activado, luego, vamos a ver mas
 */
const Mensaje = "hola mundo";
app.get("/", (req, res) => {
  //este render, es un html hijo, seria como el body/foter/headder del html
  res.render("home_ejemplo", {
    //este layount es el HTML base, asi de simple
    layout: "ejemplo",
    //estos es lo que se pasa al handlebars, puede ser cualquier cosa, se llama de la siguiente manera
    //data."algo", ej data.mensaje
    data: {
      Mensaje,
      // notar que esta función se ejecuta al renderear la vista,
      // en el servidor, no en el navegador.
      nombreMayusculas: () => Mensaje.toUpperCase(),
      listado: [1, 2, 3, 4],
      esPar: Math.ceil(Math.random() * 1000) % 2 === 0,
    },
  });
});
let accounts = [
  {
    id: 1,
    username: "paulhal",
    role: "admin",
  },
  {
    id: 2,
    username: "johndoe",
    role: "guest",
  },
  {
    id: 3,
    username: "sarahjane",
    role: "guest",
  },
];

app.get("/accounts", (request, response) => {
  response.json(accounts);
});
app.get("/accounts/:id", (request, response) => {
  //console.log(" Request ", request);
  const accountId = Number(request.params.id);
  console.log(" ESTE ES EL accountId ", accountId);
  console.log(" ESTE ES EL request.params ", request.params);
  //esto del params, es parte de la estructura del request (hay que verla, es muy grande) devuelve un id
  //en este caso , el de el json
  console.log(" ESTE ES EL accounts ", accounts);
  //console.log(" ESTE ES EL request ", request);

  const getAccount = accounts.find((account) => account.id === accountId);
  //esto de arriba es bastante shit, pero basicamente dice que si el id existe dentro del objeto
  //account, que lo devuelva
  console.log(" ESTE ES EL getAccount ", getAccount);

  if (!getAccount) {
    response.status(500).send("Account not found.");
  } else {
    response.json(getAccount);
  }
  //esto es la respuesta, si el getAccount es nulo, envia el mensaje 500, en caso contrario, lo que
  //se pide
});

//ok, los post, no andan asi nomas como los gets, necesitas algo que envie algo, como un boton
//submit, o usar el comando POST en postman, tambien es necesario usar un middleware
//express.json() para que "capture/entienda" el json que se esta mandando
app.post("/accounts", (request, response) => {
  const incomingAccount = request.body;
  console.log(" ESTE ES EL request.body ", request.body);
  console.log(" ESTE ES EL incomingAccount ", incomingAccount);

  accounts.push(incomingAccount);

  response.json(accounts);
});
app.get("/api", (req, res) => {
  res.send("GET request to the homepage");
});
//el put es para modificar algo que ya esta guardado, o eso es lo que dice en la documentacion
app.put("/accounts/:id", (request, response) => {
  const accountId = Number(request.params.id);
  console.log(" ESTE ES EL accountId ", accountId);
  //igual que el anterior, buscamos la ID
  const body = request.body;
  console.log(" ESTE ES EL body ", body);
  //lamamos al body
  const account = accounts.find((account) => account.id === accountId);
  console.log(" ESTE ES EL account ", account);
  //buscamos si lo que queremos cambier EXISTE
  const index = accounts.indexOf(account);
  console.log(" ESTE ES EL index ", index);
  //buscamos en que indice esta

  if (!account) {
    response.status(500).send("Account not found.");
    //si no existe, tira un mensaje de error
  } else {
    // como odio esta shit, aca basicamente, seleccionamos todo a lo bruto, pero en firma separada
    //algos asi, id,username,role, ect, en ves te todo junto
    //esta shit es una de esas cosas automaticas horrorosas, basicamente, junta 2 array de objetos, y
    //lo que tiene la misma key , lo reemplaza, y lo que no, lo suma, por ej, si hubiera una key
    //abc:2, la sumaria..

    const updatedAccount = { ...account, ...body };
    console.log(" ESTE ES EL updatedAccount ", updatedAccount);
    console.log(" ESTE ES EL accounts[index] ", accounts[index]);
    accounts[index] = updatedAccount;

    console.log(" ESTE ES EL updatedAccount ACTUALIZADO ", updatedAccount);

    response.send(updatedAccount);
  }
});

app.delete("/accounts/:id", (request, response) => {
  const accountId = Number(request.params.id);
  //lo mimso que arriba,buscamos si existe la id
  const newAccounts = accounts.filter((account) => account.id != accountId);
  //crea un array se solo cumpla con la condicion de arriba, basicamente, selecciona las que no son
  //la que va a ser borrada (por eso el !=)

  if (!newAccounts) {
    // si no encontras lo que queres borrar , hace eso, eso dice aca
    response.status(500).send("Account not found.");
  } else {
    //remplaza el array acounts por el nuevo, luego de borrar el dato
    accounts = newAccounts;
    response.send(accounts);
  }
});

// POST method route
app.post("/api", (req, res) => {
  res.send("POST request to the homepage");
});
//traer equipos funciona bien, no necesita cambios
function traerEquipos() {
  const equipos = JSON.parse(fs.readFileSync("./data/equipos.db.json"));
  return equipos;
}
function listadoTest(lista) {
  for (let x = 0; x < traerEquipos().length; x++) {
    lista.push(traerEquipos()[x].name);
    //lista.push(x);

    //console.log(" NOMBRES ", traerEquipos()[x].name);
  }
}
function testEnvio() {
  console.log(" Picoro");
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
  //const equipos = fs.readFileSync("./data/equipos.json");
  //res.setHeader("Content-Type", "application/json");
  console.log(" TEST ", traerEquipos().length);
  console.log(" TEST ", traerEquipos()[0].name);
  let idEquipo = traerEquipos().find(
    (elemento) => elemento.tla === req.params.tla
  );
  let datosEquipo = JSON.parse(
    fs.readFileSync(`./data/equipos/${req.params.tla}.json`)
  );
  let jugadoresEquipo = datosEquipo.squad;
  /*
  let equipoSelecionado = traerEquipos().filter(
    (elemento) => elemento.id === req.params.ID
  );
  */
  //con esto de aca abajo, podemos tomar un parametro,
  console.log(req.params.tla);
  console.log(idEquipo);

  res.render("equipo-seleccionado-TEST", {
    layout: "ejemplo",
    data: {
      //equipoSelecionado,
      idEquipo,
      w,
    },
  });
  //res.send(equipos);
});
app.get("/equiposTEST", (req, res) => {
  //const equipos = fs.readFileSync("./data/equipos.json");
  //res.setHeader("Content-Type", "application/json");
  console.log(" TEST ", traerEquipos().length);
  console.log(" TEST ", traerEquipos()[0].name);
  let listaNombres = [];
  listadoTest(listaNombres);
  console.log(req.method);
  console.log(listaNombres);
  let equipos = traerEquipos();

  res.render("home_equipos_TEST", {
    layout: "ejemplo",
    data: {
      equipos,
      listaNombres,
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
      esPar: Math.ceil(Math.random() * 1000) % 2 === 0,
    },
  });
  //res.send(equipos);
});
app.get("/editar/:tla", (req, res) => {
  //MMM, pensa bien lo que tenes que hacer, ya no necesitas ver el otro archivo...
  //tengo que traer los datos a editar, por lo que hay que llamar a lo que se quiere (tda)
  //tambien hay que guardar los nuevos datos, por lo que, se deveria usar algun post de algun tipo
  // o modificar los datos de alguna otra manera,
  //primero , voy a mostrar todo los datos como en el ver LISTO
  //ahora, vamos aponer a los datos , en cuadritos editables
  //para esto, tenemos que crear un nuevo archivos de handlebars, para el editar(ya que es diferente)
  //hay que ver, si se puede reciclar el partials
  //tambien hay que acordarse que , el enviar los datos es un post, por lo que podemos usar la estrucutra
  //que estudiamos antes que envia un formulario
  //const equipos = fs.readFileSync("./data/equipos.json");
  //res.setHeader("Content-Type", "application/json");
  console.log(" TEST ", traerEquipos().length);
  console.log(" TEST ", traerEquipos()[0].name);
  let idEquipo = traerEquipos().find(
    (elemento) => elemento.tla === req.params.tla
  );

  //con esto de aca abajo, podemos tomar un parametro,
  console.log(req.params.tla);
  console.log(idEquipo);
  console.log("CREST L EDIT", idEquipo.crestLocal);

  res.render("editar_TEST", {
    layout: "ejemplo",
    data: {
      idEquipo,
    },
  });
  //res.send(equipos);
});
//funcion para crear un equipo, modificar
//esta funcion crea un nuevo objeto equipo, su su array, y lo devuelve, hay que explicar una cosita
//mas abajo, mirala
function crearNuevoEquipo(equipo, file) {
  const nuevoEquipo = {
    //  id: equipo. No tiene.
    name: equipo.nombre,
    shortName: equipo.nombreAbreviado,
    tla: equipo.tla,
    email: equipo.email,
    area: {
      //    id: equipo.area.id, // NO se usa
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
  console.log(" CREST L0 ", nuevoEquipo.crestLocal);
  console.log(" FILE L0", file);

  //este crestlocal hay que explicar,esto es un if/else ternario(creo que se llamaba), pregunta si
  //hay que cargar desde una imagen desde el servidor  o no , tiene que ver con la estructura de como
  //muestra la los equipos
  return nuevoEquipo;
}
//este es el extra de comprobacion, esto hace lo siguiente
/**
 *espera un equipo(array), luego, lo pone en un array, y lo devulve
 * hace lo mismo que listadoTest en realidad, pero con un pasito mas, podemos juntarlos para la proxima
 *
 */
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
/**
 * ok, mira, para lo que esta en crear team funcione, tenes que si o si usar un post, y el lo que ve
 * va a usar para enviar los datos en si, tomalo como una funcion y ya, no es complicado ,
 *
 */
//mmm, creo que la diferencia entre equipos y equiposdb(database), es que uno es para trabajar
//y el otro es para guardar(el db), o eso me parece
app.post("/CrearTeam", upload.single("imagen"), (req, res) => {
  //lamamos a los equipos para guardar, osea no podemos llamar a traer equipo, por que es para trabajar
  const equipos = JSON.parse(fs.readFileSync("./data/equipos.db.json"));
  //extra de comprobasion
  const comrpobarTla = guardarTlaEquipos(equipos);
  //ESTO de aca abajo no es mio, hay que modificarlo, y explicarlo, pero cuando este desarmado, lo vamos a hacer
  if (
    comrpobarTla.find((elemento) => elemento === req.body.tla) !== undefined
    //esto es un asco, pero se lee asi, buscanmos un elemento en el body(del programa), lo que buscamos
    //es que no exista, en caso de no hacerlo, se sigue, en caso contrario,se pasa al siguien if
  ) {
    console.log(" TLAs", req.body.tla);
    //esto es para los errores, hace siguiente, si el if de arriba no se cumpla(osea , que el valor
    //ya este usado), manda un dato al crearTeam, con el campo error, diciendo que, el team que se
    //quiere crear esta usado ya, eso solo
    res.render("CrearTeam_TEST", {
      layout: "ejemplo",
      data: {
        error: `El tla ${req.body.tla} ya fue usado.`,
      },
    });
  } else if (req.file !== undefined) {
    /** esto ba a ser algo largo, asi que, pls EXPLICALO BIEN, SINO NO SIRVE
     * aca se crea el equipo de verdad en si(lo que esta en el crearTeam es un esqueleto solamente)
     * primero, en caso de que el primer IF no se cumpla, al array de equipos, le agregamos
     * un nuevo equipo, este equipo, va a tener como parametros, el body(acordate que el body es todo
     * el esqueleto que armamos antes, en este caso al ser un POST ,NO SIEMPRE ES ASI), y un nombre
     * que se va a decidir donde se va a guardar
     * luego, hace lo mismo , pero guardando este nuevo team en la carpeta de equipos, y actualiza los
     * datos en ambos archivos (en el db y el normal), uno solo mandando los equipos puros para db
     * y otro con la estructura
     * y finalmente, volvemos al home
     */
    console.log(" DIRECCION O ALGO ", req.body.tla);
    equipos.push(crearNuevoEquipo(req.body, req.file.originalname));
    fs.writeFileSync("./data/equipos.db.json", JSON.stringify(equipos));
    fs.writeFileSync(
      `./data/equipos/${req.body.tla}.json`,
      JSON.stringify(crearNuevoEquipo(req.body, req.file.originalname))
    );
    res.redirect("/equiposTEST");
  } else {
    //ultimo
    /** mmm, esto es casi igual al anterior la verdad.... a completar, solo cambia que el nombre
     * no sea undefined(osea nulo)
     *
     */
    equipos.push(crearNuevoEquipo(req.body, req.file !== undefined));
    fs.writeFileSync("./data/equipos.db.json", JSON.stringify(equipos));
    fs.writeFileSync(
      `./data/equipos/${req.body.tla}.json`,
      JSON.stringify(crearNuevoEquipo(req.body, req.file !== undefined))
    );
    res.redirect("/equiposTEST");
  }
});
//A MODIFICAR
app.get("/eliminar/:tla", (req, res) => {
  //le damos direccion
  //const equipos = JSON.parse(fs.readFileSync("./data/equipos.db.json"));
  const equipos = traerEquipos();
  //llamos a los equipos, se va a cambiar por el traer equipos
  const equiposRestantes = equipos.filter(
    (equipo) => equipo.tla !== `${req.params.tla}`
  );
  //se busca los equipos, a cambiar
  fs.writeFileSync("./data/equipos.db.json", JSON.stringify(equiposRestantes));
  //se reescribe el json de equipos
  fs.unlinkSync(`./data/equipos/${req.params.tla}.json`);
  //este unlinkSync es parte de fs, borra un archivo, asi de simple,
  res.redirect("/equiposTEST");
});
//este es el reinicio, es bastante simple lo que hace, solo rescribre el db por el json de repuesto que tenemos

app.get("/reiniciar", (req, res) => {
  const equiposTotales = JSON.parse(fs.readFileSync("./data/equipos.json"));
  fs.writeFileSync("./data/equipos.db.json", JSON.stringify(equiposTotales));
  res.redirect("/");
});
/**
 * ////////////////guia que que hacer para completar la parte 1 del la tarea////////////////////
 * ya sabemos controlar, bastate bien, el json, podemos borrarlo, modificarlo, crear uno nuevo
 * y buscar uno en espesifico, por el momento, no vamos a agregar imagenes, lo que vamos a hacer es lo siguiente
 * vamos a mostrar en pantalla, solo los nombres de los clubes(sin orden), vamos a contarlos y agregar 5 botones
 * estos botones, van a tirar un alert ("ver,editar, elinar,agregar y reinicar"),eso para empesar esta bien
 * luego de que termines esto, te digo lo que hay que hacer LISTO
 * ok, vamos a hacer lo siguiente, vamos a jugar con estos 5 botones, y vamos a simular lo que hace
 * el postman, y hacer que funcionen correctamente// error, ahy algunos problemas con el put ,pero se pueden sortear
 * nuevo objetivo, vamos a llara a cada equipo por su id, y que muestre la informacion en pantalla pura
 * para esto , ahy que seleccionar algun equipo, por el medio que se quiera (id,nombre, cualquier cosa unica)
 * hay varias formas de hacer esto, pero , vamos a intentar no hacer funciones o bucles raros y usar
 * las funciones integradas de js, en especial el find
 * para hacer esto, vamos a hacer que, cuando se seleccione este equipo, se muestre sus datos,
 * en un archivo nuevo (acordate que tenes que cambiar el res.render)(los partials son otra cosa)
 * LISTO
 * ahora, vamos a hacerlos seleccionable mediante un boton, a cada 1, solo eso
 * para hacer esto, primero, tenemos que listar cada team(solo nombre), y en otra columna, poner
 * el nombre ver, cuando se hace esto, usamos un get, y vemos la info de team es cuestion,
 * para esto, hay que modificar el home(o crear uno nuevo mejor)
 * LISTO (incluye el extra volver)
 * vamos a agregar la edicion y eliminacion de un equipo (con su correspondiente actualizacion)
 * esto va a ser un poco complicado creo, pero es lo ultimo complicado, despues, es todo limites,
 * condicionales y agregar un poco de estilo
 * objetivo actuales, crear un team(guardando su escudo), modificar un team (usando lo que ya hay),
 * y eliminarlo (como puedas,no importa como), con eso, ya tenemos el 90% terminado, luego agregamos el estilo
 *
 * para crear un team, primero, tenemos que crear todos los campos que tiene un team aceptado en el programa
 * luego  hay que llenarlos y copiarlo/moverlo al json de equipos, vamos a hacer eso primero
 * vamos a hacer un test, por que tenemos problemas en entender bien como guarda las cosas
 * un tes comparativo ente mi codigo y el que funciona
 * ok, voy a explicar lo que entendi
 * cuando cuando creamos un team, agregamos este team al equipos db, y tambien al equipos/equipos(con su nombre)
 * lo que pasa es, que como no estabamos usando el db(solo el json original), no se mostraba, pero funciona bien
 * aunque, todavia hay que explicar bien como sube la imagen ,mas arriba(en su lugar),se va a hacer
 * OK, listo hasta lo de crear un team, ahora, vamos a eliminarlo LISTO
 * ahora, vamos a completar el ver equipo, y terminamos con la mayoria de esto
 * Extra, hay que hacer el reset y listo
 * LISTO TODO, ahora, borremos lo que sobra y subamos la version con comentarios
 *
 *
 */

app.listen(PUERTO);
console.log(`Escuchando en http://localhost:${PUERTO}`);
