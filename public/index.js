var loc;//location var

function resetPage(){
    document.getElementById("keyword").value = "";
    document.getElementById("distance").value = "10";
    document.getElementById("category").value = "default";
    document.getElementById("location").value = "";
    document.getElementById("autodetect").checked = false;
    var loc = document.getElementById("location");
    if(loc.hasAttribute("disabled")){
        loc.removeAttribute("disabled");
    }
    document.getElementById("result").innerHTML = '';
    document.getElementById("detail").innerHTML = '';
}

// disable the location text input and get the location using ipinfo.io
function checkboxOnclick(checkbox){
    if(checkbox.checked){
        document.getElementById("location").value = "";
        document.getElementById("location").setAttribute("disabled","");
        $.ajax({
            type: 'GET',
            contentType: 'application/json',
            async: false,
            url: "https://ipinfo.io/json?token=873efbb5543bb5",
            success: function (data) {
                loc = data.loc
            },
            error: function(error) {
            console.log(error);
        }
        });
    }
    else
    document.getElementById("location").removeAttribute("disabled");
}

function submitInfo(){
    var keyword = document.getElementById("keyword");
    if(!keyword.checkValidity()){
        keyword.reportValidity();
        return;
    }
    var location = document.getElementById("location");
    if(!location.checkValidity()){
        location.reportValidity();
        return;
    }
    keyword = keyword.value;
    var distance = document.getElementById('distance');
    if(!distance.checkValidity()){
        distance.reportValidity();
        return;
    }
    distance = distance.value;
    distance = parseInt(distance);
    var category = document.getElementById('category').value;
    var latitude;
    var longitude;
    if(document.getElementById('autodetect').checked == false){
        var location = document.getElementById('location').value;
        $.ajax({
            type: 'GET',
            async: false,
            url: "https://maps.googleapis.com/maps/api/geocode/json?address="+location+"&key=AIzaSyAXUyVnOrZ2lrZpx6iM1rPorRjDbM1ABhg",
            success: function (loc) {
                try {
                    loc = loc.results[0].geometry.location;
                    latitude = parseFloat(loc.lat);
                    longitude = parseFloat(loc.lng);
                } catch (error) {
                    // alert(error);
                    document.getElementById("result").innerHTML = '<p id="result-none">No record has been found</p>';
                    return;
                } 
            }
        });
    }
    else{
        var location = loc.split(",");
        latitude = parseFloat(location[0]);
        longitude = parseFloat(location[1]);
    }
    getYelpData(keyword,latitude,longitude,category,distance);
    // if(yelpData.length==0)
    //     document.getElementById("result").innerHTML = '<p id="result-none">No record has been found</p>';
    // else
    //     generate_res();
    // window.location.href= url_origin+"#result";
}

function getYelpData(keyword,latitude,longitude,category,distance){
    var info = {
        term : keyword,
        latitude : latitude,
        longitude : longitude,
        categories : category,
        radius : distance*1600
    };
    $.ajax({
       type: 'GET',
       contentType: 'application/json',
       async: false,
       data: info,
       dataType: 'json',
       url: 'http://127.0.0.1:3080/' +'search_request',
       success: function (data) {
            console.log(data)
       },
       error: function(error) {
       console.log(error);
   }
   });
}