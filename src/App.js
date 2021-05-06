import './App.css';
import imageFile from './no-image.png'

function App() {
  var topFiveMovieList = [];
  function getList() {
    var tableBody = document.getElementById("table-body");
    var table = document.getElementById("result-table");
    var movieName = document.getElementById("movie-name").value;
    if (movieName !== "") {
      var url = `https://www.omdbapi.com/?apikey=47a5e075&s=` + movieName;
      fetch(url).then((response) =>
        response.json()).then(function (data) {
          console.log(data);
          var listOfMovies = data['Search'];
          if (listOfMovies) {
            clearResults();
            var tableHead = table.createTHead();
            var row = tableHead.insertRow(0);
            row.insertCell(0).innerHTML = "Movie";
            row.insertCell(1).innerHTML = "Poster and Plot";
            listOfMovies.forEach(movie => {
              var imdburl = `https://www.omdbapi.com/?apikey=47a5e075&i=` + movie['imdbID'];
              fetch(imdburl).then((response) => response.json()).then(function (imdbData) {
                if (movie['Poster'] === "N/A") {
                  movie['Poster'] = { imageFile }["imageFile"];
                }
                var rowCount = tableBody.rows.length;
                var row = tableBody.insertRow(rowCount);
                row.insertCell(0).innerHTML = movie['Title'] + `<br>` + movie['Year'];
                row.insertCell(1).innerHTML = `
                <div class="img__wrap">
                  <img class="img__img" src=` + movie['Poster'] + `/>
                  <div class="img__description_layer">
                    <div class="img__description">` +
                  imdbData['Plot'] + `<br /><button id="` + movie['imdbID'] + `" class="nominate-button"><span>Nominate</span></button>` +
                  `</div>
                  </div>
                </div>`;
                document.getElementById(movie['imdbID']).addEventListener("click", function () {
                  addNomination(movie);
                });
              })
            })
          }
          else {
            alert(data['Error']);
          }
        });
    }
    else {
      alert("Please enter a search term!");
    }
  };

  function addNomination(movie) {
    if (!checkNominationsList(movie['imdbID'])) {
      var list = document.getElementById("nominations-list-items");
      var node = document.createElement("LI");
      node.setAttribute("id", movie["imdbID"] + "-nomination-item");
      node.setAttribute("title", movie["Title"]);
      node.setAttribute("class", "nomination");
      node.innerHTML = `<img class="nomination-image" src=` + movie['Poster'] + `alt=` + movie['Title'] + `/><button class="nominate-button" id="` + movie['imdbID'] + `-button" >Remove</button>`;
      list.appendChild(node);
      document.getElementById(movie['imdbID'] + "-button").addEventListener("click", function () {
        removeFromNominationsList(movie['imdbID']);
      });
      topFiveMovieList.push(movie);
      updateLocalStorage();
    }
  }

  function clearResults() {
    var tableHeaderRowCount = 0;
    var tableBody = document.getElementById("table-body");
    var rowCount = tableBody.rows.length;
    for (var i = tableHeaderRowCount; i < rowCount; i++) {
      tableBody.deleteRow(tableHeaderRowCount);
    }
    document.getElementById("result-table").deleteTHead();
  }

  function submitForm() {
    if (window.event.keyCode === 13) {
      getList();
    };
  }

  function checkNominationsList(movieIMDB) {
    var list = document.getElementsByClassName("nomination");
    if (list.length >= 5) {
      alert("Nomination List is full, please remove a movie before nominating another one");
      return true;
    }
    else {
      for (var i = 0; i < list.length; i++) {
        if (movieIMDB + "-nomination-item" === list[i].id) {
          return true;
        }
      }
      return false;
    }
  }

  function removeFromNominationsList(movieIMDB) {
    var nomination = document.querySelector('[id=' + movieIMDB + '-nomination-item]');
    nomination.parentNode.removeChild(nomination);
    for (var i = 0; i < topFiveMovieList.length; i++) {
      if (topFiveMovieList[i]['imdbID'] === movieIMDB) {
        topFiveMovieList.splice(i, 1);
        updateLocalStorage();
        return;
      }
    }
  }

  function getLocalStorage() {
    var storedResults = window.localStorage.getItem('topfive');
    if (storedResults) {
      var nominationsList = JSON.parse(storedResults);
      nominationsList.forEach(movie => {
        topFiveMovieList.push(movie);
      });
    }
    else {
      window.localStorage.setItem('topfive', "[]");
    }
  }

  function updateLocalStorage() {
    window.localStorage.setItem('topfive', JSON.stringify(topFiveMovieList));
  }

  getLocalStorage();
  return (
    <div className="App">
      <header>
        <div className="overlay">
          <h1>Shopify Top 5 Movies Nominations</h1>
          <h3>Search and nominate your favorite movies</h3>
          <input type="text" id="movie-name" placeholder="Search by keyword or full movie name" onKeyDown={submitForm}></input>
          <br />
        </div>
      </header>
      <br />
      <div className='table-wrapper'>
        <table id="result-table">
          <tbody id="table-body">
          </tbody>
        </table>
      </div>
      <div className="nomination-list">
        <p className="nominations-list-title">Nominations List</p><br />
        <ul id="nominations-list-items" className="nominations-list-items">
          {topFiveMovieList.map((movie, index) => {
            return <li key={index} id={movie["imdbID"] + "-nomination-item"} title={movie["Title"]} className="nomination">
              <img className="nomination-image" src={movie['Poster']} alt={movie['Title']}/>
              <button className="nominate-button" onClick={()=> removeFromNominationsList(movie['imdbID'])} id={movie['imdbID'] + `-button`} >Remove</button>
              </li>
          })}
        </ul>
      </div>
    </div>
  );
}

export default App;
