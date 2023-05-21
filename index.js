const express = require('express');
const cors = require('cors');
const ejs = require('ejs')
const axios = require('axios');
const app = express(),
      port = 3080;
const api_key = 'Jsg-qejX62hVkRI02dXBTidisXOr3kt_UHqCJNATmTbWOh9mCapNk7zr6ucDKgwuKQ8AQWq2zr9aNIUbfOdi5JBANGNa7sh1iVA23kefiKDLltPIazAzIQHXa2Q-Y3Yx';

app.use(cors())

app.set("view engine","ejs")

app.use(express.static(__dirname + '/public'));

//autocomplete for the input term
app.get('/autocomplete',async(req,res)=> {
  console.log(req)
  let text = req.query.text;
  const url = 'https://api.yelp.com/v3/autocomplete'
  const req_data = {'text' : text};
  try {
    const response = await axios.get(url,{
      headers: {
        'Authorization' : `Bearer ${api_key}`
      },
      params : req_data
    })
    res.send(response.data);
  } catch (error) {
    console.log(error);
  }
}) 

//call API for business
app.get('/search_request', cors(),async(req,res)=> {
  let term = req.query.term;
  let categories = req.query.categories;
  let latitude = req.query.latitude;
  let longitude = req.query.longitude;
  let radius = req.query.radius;
  const req_data = {
                    'term': term,
                    'latitude' : latitude,
                    'longitude' : longitude,
                    'categories' : categories,
                    'radius' : radius
  }
  const url = "https://api.yelp.com/v3/businesses/search"
  
  try{
    const response = await axios.get(url,{
      headers: {
        'Authorization' : `Bearer ${api_key}`
      },
      params : req_data
    })
    res.send(response.data.businesses)
  }
  catch(err){
    console.log(err);
  }
  })


//call API for business detail
app.get('/detail_request',async(req,res)=>{
  const url = "https://api.yelp.com/v3/businesses/"+req.query.id;
  try{
    const response = await axios.get(url,{
      headers: {
        'Authorization' : `Bearer ${api_key}`
      }
    })
    res.send(response.data)
  }
  catch(err){
    console.log(err);
  }
})

//call API for business review
app.get('/reviews_request',async(req,res)=>{
  const url = "https://api.yelp.com/v3/businesses/"+req.query.id+"/reviews";
  try{
    const response = await axios.get(url,{
      headers: {
        'Authorization' : `Bearer ${api_key}`
      }
    })
    res.send(response.data)
  }
  catch(err){
    console.log(err);
  }
})

//render frontend web page
app.get('/', (req,res) => {
    res.render("index")
});


app.listen(port, () => {
  console.log(`Server listening on the port::${port}`);
});