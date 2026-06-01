const mongoose = require("mongoose");

mongoose.connect(
"mongodb://127.0.0.1:27017/auracare"
)
.then(()=>{
    console.log("MongoDB Connected Successfully");
    mongoose.connection.close();
})
.catch(err=>{
    console.log("Connection Error:", err);
});