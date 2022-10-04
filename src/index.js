const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");

const router = require("./routes/route");
const app = express();

app.use(multer().any());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//------------------- Connection Establishment Between Application and Database -------------------//

mongoose.connect("mongodb+srv://pallavi_90:eh5J7PzhYvWnStqo@cluster0.hznxhdd.mongodb.net/group60Database?retryWrites=true&w=majority", 
  { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDb is connected"))
  .catch(err => console.log(err))

app.use('/', router);

app.all('/**', (req, res) => {
  res.status(404).send({ status: false, message: 'The api you requested is not available' });
});

//------------------- Server Configuration -------------------//

app.listen(process.env.PORT || 3000, function () {
  console.log('Express app running on port ' + (process.env.PORT || 3000));
});