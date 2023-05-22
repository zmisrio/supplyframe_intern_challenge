var loc;//location var
var yelpData;
var url_origin = 'http://127.0.0.1:3080'

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
    // document.getElementById("detail").innerHTML = '';
    $("#detail")
    .css("display","none")
    window.location.href= url_origin
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
    if(yelpData.length==0)
        document.getElementById("result").innerHTML = `<p style="margin-top: 3em;">
        <b style="color: red; width: 100%; background-color: white; padding: 0.5em 100px; border-radius: 1em;">No Results available</b>
    </p>`;
    else
        generate_res();
    window.location.href= url_origin+"#result";
}

//call backend for business search API data
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
       url: url_origin +'/search_request',
       success: function (data) {
            yelpData = data
       },
       error: function(error) {
       console.log(error);
   }
   });
}

// generate result table
function generate_res(){
    var innerContent = `<div id = "results">
    <table id = "res" data-toggle="table" data-pagination="true" style='background-color: white; border-radius: 15px; text-align: center; margin-top: 50px;' class='table table-striped res_table justify-content-center'>
        <thead class='justify-content-center'>
            <tr >
            <th>#</th>
            <th>Image</th>
            <th>Business Name</th>
            <th>Rating</th>
            <th id='distance'>Distance(miles)</th>
            </tr>
        </thead>
        <tbody>`;
    for(let i = 0; i < yelpData.length; i++){       
        innerContent += `<tr id=${yelpData[i].id} onclick='get_details(this)'">
        <th scope='row'>${i+1}</th>
        <td><img class="result_image" src=${yelpData[i].image_url} alt=''></td>
        <td>${yelpData[i].name}</td>
        <td>${yelpData[i].rating}</td>
        <td>${(yelpData[i].distance/1600.0).toFixed(2)}</td>
    </tr>`
    }
    innerContent+=`</tbody>
    </table>`;
    document.getElementById("result").innerHTML = innerContent;
    $("#res").DataTable({
        lengthChange: false,
        searching: false,
        pageLength:5
    })
}


//get business detail when click the table row
function get_details(obj){
    var info = {
        id : obj.id
    }
    var details;
    $.ajax({
        type: 'GET',
        contentType: 'application/json',
        async: false,
        data: info,
        dataType: 'json',
        url: url_origin +'/detail_request',
        success: function (data) {
            console.log(data)
            details = data
        },
        error: function(error) {
        console.log(error);
    }
    });
    details = deal_with_details(details);
    generate_datails(details);
    // window.location.href= url_origin+"#detail";
}

function deal_with_details(details){
    var detail_name = details.name;
    var status = '';
    if(Reflect.has(details,'hours')&&details.hours.length>0){
        var detail_hours = details.hours[0];
        if(Reflect.has(detail_hours,'is_open_now'))
            status = detail_hours.is_open_now;
    }
    var category = ''
    if(Reflect.has(details,'categories')&&details.categories.length>0){
        category = details.categories[0].title;
        if(details.categories.length > 1){
            for(i=1; i<details.categories.length;i++){
                category += ' | '
                category += details.categories[i].title;
            }
        }
    }
    var address = '';
    var detail_location = details.location;
    if(Reflect.has(detail_location,'display_address')&&detail_location.display_address.length>0){
        for(i=0;i<detail_location.display_address.length; i++){
            address += detail_location.display_address[i];
            address += ' ';
        }
    }
    var phone_number = ''
    if(Reflect.has(details,'display_phone')){
        phone_number = details.display_phone
    }
    else if(Reflect.has(details,'phone')){
        phone_number = details.phone
    }
    var transaction = '';
    if(Reflect.has(details,'transactions')&&details.transactions.length>0){
        transaction = details.transactions[0];
        if(details.transactions.length>1){
            for(i=1; i<details.transactions.length;i++){
                transaction += ' | ';
                transaction += details.transactions[i];
            }
        }
    }
    var price = ''
    if(Reflect.has(details, 'price')){
        price = details.price;
    }
    var more_info = details.url;
    var photos = '';
    if(Reflect.has(details,'photos')){
        photos = details.photos;
    }
    var info = {
        detail_name: detail_name,
        status : status,
        category : category,
        address : address,
        phone_number : phone_number,
        transaction : transaction,
        price : price,
        more_info : more_info,
        photos : photos 
    }
    return info
}

function generate_datails(details){
    $("#business_name").text(details.detail_name)
    $("#business_address").text(details.address)
    $("#business_category").text(details.category)
    $("#business_phone").text(details.phone)
    $("#business_price").text(details.price)
    if(details.status!=''){
        if(details.status==true){
            $("#business_status")
            .append(
                $("<p/>")
                .css("color","green")
                .text("Open now")
            )
        }
        else{
            $("#business_status")
            .append(
                $("<p/>")
                .css("color","red")
                .text("Closed")
            )
        }
    }
    $("#business_link").attr("href", details.more_info)
    $("#img0").attr("src",details.photos[0])
    $("#img1").attr("src",details.photos[1])
    $("#img2").attr("src",details.photos[2])
    $("#detail")
    .css('display', 'block')
    window.location.href= url_origin+"#detail"
}

function return_to_result(){
    $("#detail")
    .css('display', 'none')
    window.location.href= url_origin+"#result"
}