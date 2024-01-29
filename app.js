const express = require("express");
const app = express();
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
app.use(express.json());
const initializeDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error:${e.message}`);
    process.exit(1);
  }
};
initializeDb();
//API1
const ConvertMovieDbAPI1 = (objectItem) => {
  return {
    movieName: objectItem.movie_name,
  };
};
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT * FROM movie;`;
  const movies = await db.all(getMoviesQuery);
  response.send(movies.map((eachMovie) => ConvertMovieDbAPI1(eachMovie)));
});
//API2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addBookQuery = `
    INSERT INTO movie (director_id,movie_name,lead_actor)
    VALUES (${directorId},'${movieName}','${leadActor}');`;
  const dbResponse = await db.run(addBookQuery);
  const bookId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});
//API3
const ConvertMovieDbAPI3 = (objectItem) => {
  return {
    movieId: objectItem.movie_id,
    directorId: objectItem.director_id,
    movieName: objectItem.movie_name,
    leadActor: objectItem.lead_actor,
  };
};
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT * FROM movie WHERE movie_id=${movieId};`;
  const getMovie = await db.get(getMovieQuery);

  response.send(ConvertMovieDbAPI3(getMovie));
});
//API4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
    UPDATE movie
    SET 
    director_id = ${directorId},
    movie_name= '${movieName}',
    lead_actor= '${leadActor}'
  WHERE
   movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});
//API5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE FROM movie
    WHERE movie_id=${movieId};`;
  await db.get(deleteQuery);
  response.send("Movie Removed");
});
//API6
const convertDirectorDbAPI6 = (objectItem) => {
  return {
    directorId: objectItem.director_id,
    directorName: objectItem.director_name,
  };
};
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT * FROM director;`;
  const directors = await db.all(getDirectorsQuery);
  response.send(directors.map((eachItem) => convertDirectorDbAPI6(eachItem)));
});
//API7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directorMovieQuery = `
    SELECT movie_name AS movieName FROM movie WHERE
  director_id = ${directorId};`;
  const directorMovie = await db.all(directorMovieQuery);
  response.send(directorMovie);
});
module.exports = app;
